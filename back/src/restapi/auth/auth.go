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
	c "github.com/gorilla/context"
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

func init() {
	json := os.Getenv("OAUTH_JSON")
	if json == "" {
		log.Fatal("Please set the OAUTH_JSON environment variable")
	}
	config, err := google.ConfigFromJSON([]byte(json), "openid", "profile", "email")
	if err != nil {
		log.Fatal(err.Error())
	}
	googleOauthConfig = config
}

// HandleGoogleCallback receive request from Google after API validating credentials
func HandleGoogleCallback(w http.ResponseWriter, r *http.Request) {
	content, err := getUserInfo(r.FormValue("access_token"))
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

	userFound := u.User{}
	err = utils.GetConnection().Preload("Role").Where("mail=? AND is_active = ?", googleUser.Email, true).Find(&userFound).Error
	if err != nil {
		http.Error(w, err.Error(), 404)
		return
	}

	t, err := createJWTFromCredentials(googleUser)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	auth := &AuthResponse{User: userFound, Token: t}
	utils.Respond(w, auth)
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

func getUserInfo(authToken string) ([]byte, error) {

	response, err := http.Get("https://www.googleapis.com/oauth2/v2/userinfo?access_token=" + authToken)
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
					return signingKey, nil
				})
				if err != nil {
					http.Error(w, err.Error(), 400)
					return
				}
				if !token.Valid {
					http.Error(w, "Not a valid token", 403)
				}
				user, err := getUserFromClaims(token.Claims)
				if err != nil {
					http.Error(w, "No user found for this token", 403)
					return
				}
				c.Set(r, "user", user)
				next(w, r)
				return
			}
			http.Error(w, "Bad token format, expected \"Bearer <token>\"", 400)
			return
		}
		http.Error(w, "No token provided", 400)
		return
	})
}

func getUserFromClaims(claims jwt.Claims) (*u.User, error) {
	db := utils.GetConnection()

	var googleUser GoogleUser
	mapstructure.Decode(claims.(jwt.MapClaims), &googleUser)

	var u u.User

	if err := db.Set("gorm:auto_preload", true).Where("mail=? AND is_active = ?", googleUser.Email, true).Find(&u).Error; err != nil {
		return nil, err
	}
	return &u, nil
}
