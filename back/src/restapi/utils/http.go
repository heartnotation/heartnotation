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
