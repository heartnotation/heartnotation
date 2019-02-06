package main

import (
	"net/http"
	a "restapi/annotation"

	"github.com/gorilla/mux"
)

func main() {
	router := mux.NewRouter()
	router.HandleFunc("/annotations", a.CreateAnnotation).Methods("POST")
	http.ListenAndServe(":8000", router)
}
