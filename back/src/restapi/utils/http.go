package utils

import (
	"encoding/json"
	"net/http"

	"github.com/jinzhu/gorm"
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

func CheckErrorCode(err error, w http.ResponseWriter) bool {
	if err != nil {
		switch err {
		case gorm.ErrRecordNotFound:
			http.Error(w, err.Error(), 204)
		case gorm.ErrInvalidSQL:
			http.Error(w, err.Error(), 400)
		case gorm.ErrInvalidTransaction:
		case gorm.ErrCantStartTransaction:
		case gorm.ErrUnaddressable:
		default:
			http.Error(w, err.Error(), 500)
			return true
		}
	}
	return false
}
