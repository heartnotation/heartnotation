package managers

import (
	"net/http"
	m "restapi/models"
	u "restapi/utils"
)

// GetAll list all enum status
func getAll(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("GET", u.CheckRoutes["enumstatus"], w, r) {
		return
	}
	enumStatus := []m.EnumStatus{}
	if u.CheckErrorCode(u.GetConnection().Set("gorm:auto_preload", true).Find(&enumStatus).Error, w) {
		return
	}
	u.Respond(w, enumStatus)
}
