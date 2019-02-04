package main

import (
	a "restapi/annotation"

	"github.com/gorilla/mux"
)

func main() {
	router := mux.NewRouter()
	router.HandleFunc("/annotations", a.CreateAnnotation).Methods("POST")
}
