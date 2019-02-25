package utils

import (
	"io/ioutil"
	"log"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gorilla/mux"
)

// checkMethods const to test methods
var checkMethods = [4]string{"GET", "POST", "PUT", "DELETE"}

// CheckRoutes const to test all route
var CheckRoutes = map[string]string{
	"annotations":          "/annotations",
	"annotationscomment":   "/annotations/comments",
	"enumstatus":           "/enumstatus",
	"intervaltags":         "/interval/tags",
	"interval":             "/interval",
	"intervalscomments":    "/intervals/comments",
	"intervals":            "/intervals",
	"intervalstags":        "/intervals/tags",
	"intervalsannotations": "/intervals/annotations",
	"organizations":        "/organizations",
	"roles":                "/roles",
	"signal":               "/signal",
	"status":               "/status",
	"tag":                  "/tag",
	"tags":                 "/tags",
	"user":                 "/user",
	"users":                "/users"}

// CheckPayloadInt payload to test int path url
var CheckPayloadInt = []string{"aa", "", "a3B", "'3afea'"}

// BodyHTTPRequestURL return http body response
func BodyHTTPRequestURL(fp func(http.ResponseWriter, *http.Request), method string, url string, args map[string]string) *http.Response {
	req, _ := http.NewRequest(method, url, nil)
	req = mux.SetURLVars(req, args)
	res := httptest.NewRecorder()
	fp(res, req)
	return res.Result()
}

// CheckMethod check the method of a route
func CheckMethod(m string, r string, fp func(http.ResponseWriter, *http.Request), t *testing.T) {
	for i := 0; i < len(checkMethods); i++ {
		if checkMethods[i] != m {
			resp := BodyHTTPRequestURL(fp, checkMethods[i], r, nil)
			if resp.StatusCode != 400 {
				t.Error("Bad Method : expected error code", "400")
				return
			}
		}
	}
}

// CheckPath check the path of a route
func CheckPath(m string, r string, fp func(http.ResponseWriter, *http.Request), t *testing.T) {
	routesValues := MapValues(CheckRoutes)
	for i := 0; i < len(routesValues); i++ {
		if !strings.HasPrefix(routesValues[i], r) {
			resp := BodyHTTPRequestURL(fp, m, routesValues[i], nil)
			if resp.StatusCode != 400 {
				log.Println(r)
				log.Println(routesValues[i])
				t.Error("Bad route : expected error code", "400")
			}
		}
	}
}

// CheckMethodPath check the method and the route
func CheckMethodPath(m string, p string, w http.ResponseWriter, r *http.Request) bool {
	if r.Method != m {
		http.Error(w, "Bad request", 400)
		return true
	}
	if !strings.HasPrefix(r.URL.String(), p) {
		http.Error(w, "Bad request", 400)
		return true
	}
	return false
}

// CheckPayload check the payload of a route
func CheckPayload(m string, r string, fp func(http.ResponseWriter, *http.Request), pw string, pt []string, t *testing.T) {
	for i := 0; i < len(pt); i++ {
		req, _ := http.NewRequest(m, r, nil)
		req = mux.SetURLVars(req, map[string]string{pw: pt[i]})
		res := httptest.NewRecorder()
		fp(res, req)
		resp := res.Result()
		if resp.StatusCode != 400 {
			t.Error("Bad route : expected error code", "400")
		}
	}
}

// CreateTest test the creation
func CreateTest(r string) {
	//http.PostForm(r, url.Values{"mail": "rom@gmail.com", "role_id": 2, "organizations": []int{1, 2}, "is_active": true})
}

// ReadTest test the selection
func ReadTest(r string) string {
	resp, _ := http.Get(r)
	contents, _ := ioutil.ReadAll(resp.Body)
	return string(contents)
}

// UpdateTest test the update
func UpdateTest() {

}

// DeleteTest test the remove
func DeleteTest() {

}
