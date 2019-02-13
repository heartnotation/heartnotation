package auth

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	jwt "github.com/dgrijalva/jwt-go"
	"github.com/gorilla/context"
	"github.com/mitchellh/mapstructure"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"

	u "restapi/user"
	"restapi/utils"
)

var (
	googleOauthConfig *oauth2.Config
	signingKey        = []byte("h3ar7n07a710n")
)

const oauthStateString = "pseudo-random"

func init() {
	c, err := ioutil.ReadFile(os.Getenv("GOPATH") + "/credentials.json")
	if err != nil {
		log.Fatal("Error while reading credentials. Please put the credentials file at $GOPATH/credentials.json")
	}

	googleOauthConfig, err = google.ConfigFromJSON(c, "openid", "profile", "email")
	if err != nil {
		log.Fatal(err.Error())
	}
}

// HandleAuth receive authentication request
func HandleAuth(w http.ResponseWriter, r *http.Request) {
	url := googleOauthConfig.AuthCodeURL(oauthStateString)
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

// HandleGoogleCallback receive request from Google after API validating credentials
func HandleGoogleCallback(w http.ResponseWriter, r *http.Request) {
	content, err := getUserInfo(r.FormValue("state"), r.FormValue("code"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusTemporaryRedirect)
		return
	}
	var googleUser GoogleUser
	err = json.Unmarshal(content, &googleUser)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	token, err := createJWTFromCredentials(googleUser)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	utils.Respond(w, token)
}

func createJWTFromCredentials(user GoogleUser) (string, error) {
	token := jwt.New(jwt.SigningMethodHS256)
	claims := token.Claims.(jwt.MapClaims)

	claims["authorized"] = true
	claims["email"] = user.Email
	claims["exp"] = time.Now().Add(time.Minute * 30).Unix()

	tokenString, err := token.SignedString(signingKey)

	if err != nil {
		return "", err
	}
	return tokenString, nil
}

func getUserInfo(state string, code string) ([]byte, error) {
	if state != oauthStateString {
		return nil, fmt.Errorf("invalid oauth state")
	}

	token, err := googleOauthConfig.Exchange(oauth2.NoContext, code)
	if err != nil {
		return nil, fmt.Errorf("code exchange failed: %s", err.Error())
	}

	response, err := http.Get("https://www.googleapis.com/oauth2/v2/userinfo?access_token=" + token.AccessToken)
	if err != nil {
		return nil, fmt.Errorf("failed getting user info: %s", err.Error())
	}

	defer response.Body.Close()
	contents, err := ioutil.ReadAll(response.Body)
	if err != nil {
		return nil, fmt.Errorf("failed reading response body: %s", err.Error())
	}

	return contents, nil
}

// ValidateMiddleware is a middleware to check user credentials and authorizations
func ValidateMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authorizationHeader := r.Header.Get("Authorization")
		if authorizationHeader != "" {
			bearerToken := strings.Split(authorizationHeader, " ")
			if len(bearerToken) == 2 {
				token, err := jwt.Parse(bearerToken[1], func(token *jwt.Token) (interface{}, error) {
					if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
						return nil, fmt.Errorf("Wrong signing method")
					}
					return []byte(signingKey), nil
				})
				if err != nil {
					json.NewEncoder(w).Encode(err.Error())
					return
				}
				if token.Valid {
					user, err := getUserFromClaims(token.Claims)
					if err != nil {
						http.Error(w, "Access refused", 403)
						return
					}
					context.Set(r, "user", user)
					next(w, r)
				}
			}
		}
	})
}

func getUserFromClaims(claims jwt.Claims) (*u.User, error) {
	db := utils.GetConnection()

	var googleUser GoogleUser
	mapstructure.Decode(claims.(jwt.MapClaims), &googleUser)
	fmt.Printf("%v", googleUser)
	var u u.User

	if err := db.Preload("Role").Where("mail=?", googleUser.Email).Find(&u).Error; err != nil {
		return nil, err
	}
	return &u, nil
}
