package main

import (
	"net/http"
	auth "restapi/auth"
	m "restapi/managers"
	utils "restapi/utils"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

func main() {
	db := utils.GetConnection()
	defer db.Close()

	router := mux.NewRouter()

	// Annotations
	router.HandleFunc("/annotations/{id}", auth.ValidateMiddleware(m.FindAnnotationByID)).Methods("GET") //Revoir le format de l'URL /annotations/{id}
	router.HandleFunc("/annotations", auth.ValidateMiddleware(m.FindAnnotations)).Methods("GET")
	router.HandleFunc("/annotations", auth.ValidateMiddleware(m.ModifyAnnotation)).Methods("PUT")
	router.HandleFunc("/annotations", auth.ValidateMiddleware(m.CreateAnnotation)).Methods("POST")
	router.HandleFunc("/annotations/{id}", auth.ValidateMiddleware(m.DeleteAnnotation)).Methods("DELETE")
	router.HandleFunc("/signal/{id}", auth.ValidateMiddleware(m.CheckSignal)).Methods("GET")

	// Organizations
	router.HandleFunc("/organizations", auth.ValidateMiddleware(m.GetOrganizations)).Methods("GET")

	// Tags
	router.HandleFunc("/tags", auth.ValidateMiddleware(m.GetTags)).Methods("GET")

	// Users
	router.HandleFunc("/users", auth.ValidateMiddleware(m.CreateUser)).Methods("POST")
	router.HandleFunc("/users", auth.ValidateMiddleware(m.GetAllUsers)).Methods("GET")
	router.HandleFunc("/users/{id}", auth.ValidateMiddleware(m.FindUserByID)).Methods("GET")
	router.HandleFunc("/users/{id}", auth.ValidateMiddleware(m.DeleteUser)).Methods("DELETE")
	router.HandleFunc("/users", auth.ValidateMiddleware(m.ModifyUser)).Methods("PUT")
	router.HandleFunc("/roles", auth.ValidateMiddleware(m.GetAllRoles)).Methods("GET")

	// Interval
	router.HandleFunc("/intervals", m.GetInterval).Methods("GET")
	router.HandleFunc("/intervals", m.CreateInterval).Methods("POST")
	router.HandleFunc("/intervals/tags", m.CreateIntervalTag).Methods("POST")
	router.HandleFunc("/intervals/comment/{id}", m.GetIntervalComment).Methods("GET")
	router.HandleFunc("/intervals/comment", m.CreateComment).Methods("POST")

	// Auth
	router.HandleFunc("/auth/callback", auth.HandleGoogleCallback).Methods("POST")

	headersOk := handlers.AllowedHeaders([]string{"Authorization", "Content-Type"})
	originsOk := handlers.AllowedOrigins([]string{"*"})
	methodsOk := handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"})

	http.ListenAndServe("0.0.0.0:8000", handlers.CORS(originsOk, headersOk, methodsOk)(router))
}
