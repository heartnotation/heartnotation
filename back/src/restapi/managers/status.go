package managers

import (
	"net/http"
	m "restapi/models"
	u "restapi/utils"

	"github.com/gorilla/mux"
)

// GetAllStatus list all status
func GetAllStatus(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("GET", u.CheckRoutes["status"], w, r) {
		return
	}
	status := []m.Status{}
	if u.CheckErrorCode(u.GetConnection().Preload("User").Preload("EnumStatus").Find(&status).Error, w) {
		return
	}
	u.Respond(w, status)
}

// FindStatusByID find status by ID using GET Request
func FindStatusByID(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("GET", u.CheckRoutes["status"], w, r) {
		return
	}
	status := m.Status{}
	vars := mux.Vars(r)
	if u.CheckErrorCode(u.GetConnection().Preload("User").Preload("EnumStatus").First(&status, vars["id"]).Error, w) {
		return
	}
	u.Respond(w, status)
}
