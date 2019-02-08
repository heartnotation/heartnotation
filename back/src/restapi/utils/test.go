package utils

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gorilla/mux"
)

// checkMethods const to test methods
var checkMethods = [4]string{"GET", "POST", "PUT", "DELETE"}

// CheckRoutes const to test all route
var CheckRoutes = map[string]string{"annotations": "/annotations/", "signal": "/signal/", "organizations": "/organizations/", "tags": "/tags/", "users": "/users/", "roles": "/roles/"}

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
		if routesValues[i] != r {
			resp := BodyHTTPRequestURL(fp, m, routesValues[i], nil)
			if resp.StatusCode != 400 {
				t.Error("Bad route : expected error code", "400")
			}
		}
	}
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
func CreateTest() {

}

// ReadTest test the selection
func ReadTest() {

}

// UpdateTest test the update
func UpdateTest() {

}

// DeleteTest test the remove
func DeleteTest() {

}
