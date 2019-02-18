package main

import (
	"net/http"
	"restapi/auth"
	m "restapi/managers"
	utils "restapi/utils"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

func main() {
	db := utils.GetConnection()
	defer db.Close()

	router := mux.NewRouter()

	router.HandleFunc("/intervals", m.GetAllIntervals).Methods("GET")

	// Annotations
	router.HandleFunc("/annotations/{id}", m.FindAnnotationByID).Methods("GET") //Revoir le format de l'URL /annotations/{id}*/
	router.HandleFunc("/annotations", m.GetAllAnnotations).Methods("GET")
	router.HandleFunc("/annotations", a.UpdateAnnotation).Methods("PUT")
	router.HandleFunc("/annotations", m.CreateAnnotation).Methods("POST")
	router.HandleFunc("/annotations/{id}", m.DeleteAnnotation).Methods("DELETE")
	router.HandleFunc("/signal/{id}", m.CheckSignal).Methods("GET")

	// Organizations
	router.HandleFunc("/organizations", m.GetAllOrganizations).Methods("GET")

	// Tags
	router.HandleFunc("/tags", m.GetAllTags).Methods("GET")

	// Users
	router.HandleFunc("/users", m.CreateUser).Methods("POST")
	router.HandleFunc("/users", m.GetAllUsers).Methods("GET")
	router.HandleFunc("/users/{id}", m.FindUserByID).Methods("GET")
	router.HandleFunc("/users/{id}", m.DeleteUser).Methods("DELETE")
	router.HandleFunc("/users", u.ModifyUser).Methods("PUT")
	router.HandleFunc("/roles", m.GetAllRoles).Methods("GET")

	// Interval
	router.HandleFunc("/intervals", m.GetAllIntervals).Methods("GET")
	/*
		router.HandleFunc("/intervals", i.CreateInterval).Methods("POST")
		router.HandleFunc("/intervals/tags", i.CreateIntervalTag).Methods("POST")
		router.HandleFunc("/intervals/comment/{id}", i.GetIntervalComment).Methods("GET")
		router.HandleFunc("/intervals/comment", i.CreateComment).Methods("POST")
	*/
	// Auth
	router.HandleFunc("/auth/callback", auth.HandleGoogleCallback).Methods("POST")

	headersOk := handlers.AllowedHeaders([]string{"Authorization", "Content-Type"})
	originsOk := handlers.AllowedOrigins([]string{"*"})
	methodsOk := handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"})
	http.ListenAndServe("0.0.0.0:8000", handlers.CORS(originsOk, headersOk, methodsOk)(router))
	//http.ListenAndServe("0.0.0.0:8000", router)
}
