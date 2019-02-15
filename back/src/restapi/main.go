package main

import (
	"net/http"
	a "restapi/annotation"
	auth "restapi/auth"
	i "restapi/interval"
	o "restapi/organization"
	s "restapi/signal"
	t "restapi/tag"
	u "restapi/user"
	utils "restapi/utils"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

func main() {
	db := utils.GetConnection()
	defer db.Close()

	router := mux.NewRouter()

	// Annotations
	router.HandleFunc("/annotations/{id}", auth.ValidateMiddleware(a.FindAnnotationByID)).Methods("GET") //Revoir le format de l'URL /annotations/{id}
	router.HandleFunc("/annotations", auth.ValidateMiddleware(a.FindAnnotations)).Methods("GET")
	router.HandleFunc("/annotations", auth.ValidateMiddleware(a.ModifyAnnotation)).Methods("PUT")
	router.HandleFunc("/annotations", auth.ValidateMiddleware(a.CreateAnnotation)).Methods("POST")
	router.HandleFunc("/annotations/{id}", auth.ValidateMiddleware(a.DeleteAnnotation)).Methods("DELETE")
	router.HandleFunc("/signal/{id}", auth.ValidateMiddleware(s.CheckSignal)).Methods("GET")

	// Organizations
	router.HandleFunc("/organizations", auth.ValidateMiddleware(o.GetOrganizations)).Methods("GET")

	// Tags
	router.HandleFunc("/tags", auth.ValidateMiddleware(t.GetTags)).Methods("GET")

	// Users
	router.HandleFunc("/users", auth.ValidateMiddleware(u.CreateUser)).Methods("POST")
	router.HandleFunc("/users", auth.ValidateMiddleware(u.GetAllUsers)).Methods("GET")
	router.HandleFunc("/users/{id}", auth.ValidateMiddleware(u.FindUserByID)).Methods("GET")
	router.HandleFunc("/users/{id}", auth.ValidateMiddleware(u.DeleteUser)).Methods("DELETE")
	router.HandleFunc("/users", auth.ValidateMiddleware(u.ModifyUser)).Methods("PUT")
	router.HandleFunc("/roles", auth.ValidateMiddleware(u.GetAllRoles)).Methods("GET")

	// Interval
	router.HandleFunc("/intervals/tag", auth.ValidateMiddleware(i.GetIntervalTag)).Methods("GET")
	router.HandleFunc("/intervals/tags", auth.ValidateMiddleware(i.CreateIntervalTag)).Methods("POST")
	router.HandleFunc("/intervals/comment", auth.ValidateMiddleware(i.GetIntervalComment)).Methods("GET")
	router.HandleFunc("/intervals/comment", auth.ValidateMiddleware(i.CreateIntervalComment)).Methods("POST")
	router.HandleFunc("/intervals", auth.ValidateMiddleware(i.CreateInterval)).Methods("POST")
	router.HandleFunc("/intervals", auth.ValidateMiddleware(i.GetInterval)).Methods("GET")

	// Auth
	router.HandleFunc("/auth/callback", auth.HandleGoogleCallback).Methods("POST")

	headersOk := handlers.AllowedHeaders([]string{"Authorization"})
	originsOk := handlers.AllowedOrigins([]string{"*"})
	methodsOk := handlers.AllowedMethods([]string{"GET", "HEAD", "POST", "PUT", "OPTIONS"})

	http.ListenAndServe("0.0.0.0:8000", handlers.CORS(originsOk, headersOk, methodsOk)(router))
}
