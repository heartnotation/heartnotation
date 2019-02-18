package managers

import (
	"net/http"
	m "restapi/models"
	u "restapi/utils"
)

// GetAll list all tags
func GetAll(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("GET", u.CheckRoutes["tags"], w, r) {
		return
	}
	tags := []m.Tag
	if u.CheckErrorCode(u.GetConnection().Set("gorm:auto_preload", true).Find(&tags).Error, w) {
		return
	}
	u.Respond(w, tags)
}
