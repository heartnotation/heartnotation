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

	// Annotations
	router.HandleFunc("/annotation/{id}", m.FindAnnotationByID).Methods("GET") //Revoir le format de l'URL /annotations/{id}*/
	router.HandleFunc("/annotations", m.GetAllAnnotations).Methods("GET")
	//router.HandleFunc("/annotations", a.UpdateAnnotation).Methods("PUT")
	router.HandleFunc("/annotations", m.CreateAnnotation).Methods("POST")
	router.HandleFunc("/annotation/{id}", m.DeleteAnnotation).Methods("DELETE")
	router.HandleFunc("/annotation/comment", m.CreateCommentOnAnnotation).Methods("POST")
	router.HandleFunc("/signal/{id}", m.CheckSignal).Methods("GET")

	//Status
	router.HandleFunc("/status", m.CreateStatus).Methods("POST")

	// Organizations
	router.HandleFunc("/organizations", m.GetAllOrganizations).Methods("GET")

	// Tags
	router.HandleFunc("/tags", m.GetAllTags).Methods("GET")
	router.HandleFunc("/tag", m.CreateTag).Methods("POST")
	router.HandleFunc("/tag/{id}", m.RemoveTagByID).Methods("DELETE")
	router.HandleFunc("/tag", m.UpdateTagByID).Methods("PUT")

	// EnumStatus
	router.HandleFunc("/enumstatus", m.GetAllEnumStatus).Methods("GET")
	router.HandleFunc("/enumstatus/{id}", m.FindEnumStatusByID).Methods("GET")

	// Users
	router.HandleFunc("/user", m.CreateUser).Methods("POST")
	router.HandleFunc("/users", m.GetAllUsers).Methods("GET")
	router.HandleFunc("/user/{id}", m.FindUserByID).Methods("GET")
	router.HandleFunc("/user/{id}", m.DeleteUser).Methods("DELETE")
	router.HandleFunc("/user", m.UpdateUser).Methods("PUT")
	router.HandleFunc("/roles", m.GetAllRoles).Methods("GET")

	// Interval
	router.HandleFunc("/interval/tags", m.AddTagsOnInterval).Methods("POST")
	router.HandleFunc("/interval/comment", m.CreateCommentOnInterval).Methods("POST")
	router.HandleFunc("/interval", m.CreateInterval).Methods("POST")
	router.HandleFunc("/interval/{id}", m.RemoveIntervalByID).Methods("DELETE")
	router.HandleFunc("/interval/{id}", m.FindIntervalByID).Methods("GET")
	router.HandleFunc("/interval/annotation/{id}", m.FindIntervalByAnnotationID).Methods("GET")

	// Auth
	router.HandleFunc("/auth/callback", auth.HandleGoogleCallback).Methods("POST")

	headersOk := handlers.AllowedHeaders([]string{"Authorization", "Content-Type"})
	originsOk := handlers.AllowedOrigins([]string{"*"})
	methodsOk := handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"})
	http.ListenAndServe("0.0.0.0:8000", handlers.CORS(originsOk, headersOk, methodsOk)(router))
}
