package main

import (
	"net/http"
	a "restapi/annotation"
	o "restapi/organization"
	u "restapi/user"
	utils "restapi/utils"

	"github.com/gorilla/mux"
)

func main() {
	db := utils.GetConnection()
	defer db.Close()

	router := mux.NewRouter()
	router.HandleFunc("/annotations", a.FindAnnotations).Methods("GET")
	router.HandleFunc("/annotations", a.CreateAnnotation).Methods("POST")
	router.HandleFunc("/users", u.GetAllUsers).Methods("GET")
	router.HandleFunc("/organizations", o.GetOrganizations).Methods("GET")
	http.ListenAndServe(":8000", router)
}
