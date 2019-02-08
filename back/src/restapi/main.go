package main

import (
	"net/http"
	a "restapi/annotation"
	o "restapi/organization"
	t "restapi/tag"
	u "restapi/user"
	utils "restapi/utils"

	"github.com/gorilla/mux"
)

func main() {
	db := utils.GetConnection()
	defer db.Close()

	router := mux.NewRouter()

	// Annotations
	router.HandleFunc("/annotations", a.FindAnnotations).Methods("GET")
	router.HandleFunc("/annotations", a.CreateAnnotation).Methods("POST")

	// Users
	router.HandleFunc("/users", u.GetAllUsers).Methods("GET")

	// Organizations
	router.HandleFunc("/organizations", o.GetOrganizations).Methods("GET")

	// Tags
	router.HandleFunc("/tags", t.GetTags).Methods("GET")

	http.ListenAndServe("0.0.0.0:8000", router)
}
