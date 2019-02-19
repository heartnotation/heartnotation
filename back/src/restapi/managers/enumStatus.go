package managers

import (
	"net/http"
	m "restapi/models"
	u "restapi/utils"

	"github.com/gorilla/mux"
)

// GetAllEnumStatus list all enum status
func GetAllEnumStatus(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("GET", u.CheckRoutes["enumstatus"], w, r) {
		return
	}
	enumStatus := []m.EnumStatus{}
	if u.CheckErrorCode(u.GetConnection().Set("gorm:auto_preload", true).Find(&enumStatus).Error, w) {
		return
	}
	u.Respond(w, enumStatus)
}

// FindEnumStatusByID find enumstatus by ID using GET Request
func FindEnumStatusByID(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("GET", u.CheckRoutes["enumstatus"], w, r) {
		return
	}
	enumStatus := m.EnumStatus{}
	vars := mux.Vars(r)
	if u.CheckErrorCode(u.GetConnection().Set("gorm:auto_preload", true).First(&enumStatus, vars["id"]).Error, w) {
		return
	}
	u.Respond(w, enumStatus)
}
