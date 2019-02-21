package managers

import (
	"net/http"
	m "restapi/models"
	u "restapi/utils"
)

// GetAllRoles list all roles
func GetAllRoles(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("GET", u.CheckRoutes["roles"], w, r) {
		return
	}
	roles := []m.Role{}
	if u.CheckErrorCode(u.GetConnection().Preload("Users").Where("is_active = ?", true).Find(&roles).Error, w) {
		return
	}
	u.Respond(w, roles)
}
