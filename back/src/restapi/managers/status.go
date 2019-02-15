package managers

import (
	"net/http"
	m "restapi/models"
	u "restapi/utils"
)

// GetAllStatus list all status
func GetAllStatus(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("GET", u.CheckRoutes["status"], w, r) {
		return
	}
	status := []m.Status{}
	if u.CheckErrorCode(u.GetConnection().Set("gorm:auto_preload", true).Find(&status).Error, w) {
		return
	}
	u.Respond(w, status)
}
