package utils

import (
	"encoding/json"
	"net/http"
)

// Respond send the data passed as JSON by the ResponseWritter passed
func Respond(w http.ResponseWriter, data interface{}) {
	w.Header().Add("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

// RespondCreate send HTTP response with status code 201 to indicate object creation
func RespondCreate(w http.ResponseWriter, data interface{}) {
	w.Header().Add("Content-Type", "application/json")
	w.WriteHeader(201)
	json.NewEncoder(w).Encode(data)
}
