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
	router.HandleFunc("/annotations/{id}", auth.ValidateMiddleware(m.FindAnnotationByID)).Methods("GET") //Revoir le format de l'URL /annotations/{id}*/
	router.HandleFunc("/annotations", auth.ValidateMiddleware(m.GetAllAnnotations)).Methods("GET")
	router.HandleFunc("/annotations", auth.ValidateMiddleware(m.UpdateAnnotation)).Methods("PUT")
	router.HandleFunc("/annotations/status", auth.ValidateMiddleware(m.UpdateAnnotationStatus)).Methods("PUT")
	router.HandleFunc("/annotations", auth.ValidateMiddleware(m.CreateAnnotation)).Methods("POST")
	router.HandleFunc("/annotations/{id}", auth.ValidateMiddleware(m.DeleteAnnotation)).Methods("DELETE")
	router.HandleFunc("/annotations/comment", auth.ValidateMiddleware(m.CreateCommentOnAnnotation)).Methods("POST")
	router.HandleFunc("/signal/{id}", auth.ValidateMiddleware(m.CheckSignal)).Methods("GET")

	// Organizations
	router.HandleFunc("/organizations", auth.ValidateMiddleware(m.GetAllOrganizations)).Methods("GET")
	router.HandleFunc("/organizations", auth.ValidateMiddleware(m.CreateOrganization)).Methods("POST")
	router.HandleFunc("/organizations", auth.ValidateMiddleware(m.ChangeOrganization)).Methods("PUT")

	// Tags
	router.HandleFunc("/tags", auth.ValidateMiddleware(m.GetAllTags)).Methods("GET")
	router.HandleFunc("/tags", auth.ValidateMiddleware(m.CreateTag)).Methods("POST")
	router.HandleFunc("/tags/{id}", auth.ValidateMiddleware(m.RemoveTagByID)).Methods("DELETE")
	router.HandleFunc("/tags", auth.ValidateMiddleware(m.UpdateTagByID)).Methods("PUT")

	// EnumStatus
	router.HandleFunc("/enumstatus", auth.ValidateMiddleware(m.GetAllEnumStatus)).Methods("GET")
	router.HandleFunc("/enumstatus/{id}", auth.ValidateMiddleware(m.FindEnumStatusByID)).Methods("GET")

	// Users
	router.HandleFunc("/users", auth.ValidateMiddleware(m.CreateUser)).Methods("POST")
	router.HandleFunc("/users", auth.ValidateMiddleware(m.GetAllUsers)).Methods("GET")
	router.HandleFunc("/users/{id}", auth.ValidateMiddleware(m.FindUserByID)).Methods("GET")
	router.HandleFunc("/users/{id}", auth.ValidateMiddleware(m.DeleteUser)).Methods("DELETE")
	router.HandleFunc("/users", auth.ValidateMiddleware(m.UpdateUser)).Methods("PUT")
	router.HandleFunc("/roles", auth.ValidateMiddleware(m.GetAllRoles)).Methods("GET")

	// Interval
	router.HandleFunc("/intervals/tags", auth.ValidateMiddleware(m.AddTagsOnInterval)).Methods("POST")
	router.HandleFunc("/intervals/comment", auth.ValidateMiddleware(m.CreateCommentOnInterval)).Methods("POST")
	router.HandleFunc("/intervals", auth.ValidateMiddleware(m.CreateInterval)).Methods("POST")
	router.HandleFunc("/intervals/{id}", auth.ValidateMiddleware(m.RemoveIntervalByID)).Methods("DELETE")
	router.HandleFunc("/intervals/{id}", auth.ValidateMiddleware(m.FindIntervalByID)).Methods("GET")
	router.HandleFunc("/intervals/annotation/{id}", auth.ValidateMiddleware(m.FindIntervalByAnnotationID)).Methods("GET")

	// Auth
	router.HandleFunc("/auth/callback", auth.HandleGoogleCallback).Methods("POST")

	headersOk := handlers.AllowedHeaders([]string{"Authorization", "Content-Type"})
	originsOk := handlers.AllowedOrigins([]string{"*"})
	methodsOk := handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"})
	http.ListenAndServe("0.0.0.0:8000", handlers.CORS(originsOk, headersOk, methodsOk)(router))
}
