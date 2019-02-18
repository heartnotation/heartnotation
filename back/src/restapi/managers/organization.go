package managers

import (
	"net/http"
	m "restapi/models"
	u "restapi/utils"
)

// GetAll list all organizations
func GetAll(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("GET", u.CheckRoutes["organizations"], w, r) {
		return
	}
	organizations := []m.Organization
	if u.CheckErrorCode(u.GetConnection().Set("gorm:auto_preload", true).Find(&organizations).Error, w) {
		return
	}
	u.Respond(w, organizations)
}
