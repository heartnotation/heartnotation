package managers

import (
	"net/http"
	m "restapi/models"
	u "restapi/utils"
)

// GetAll list all roles
func GetAll(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("GET", u.CheckRoutes["roles"], w, r) {
		return
	}
	roles := []m.Role
	if u.CheckErrorCode(u.GetConnection().Set("gorm:auto_preload", true).Find(&roles).Error, w) {
		return
	}
	u.Respond(w, roles)
}
