package managers

import (
	"net/http"
	m "restapi/models"
	u "restapi/utils"
)

// GetAll list all comments of annotations
func GetAll(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("GET", u.CheckRoutes["annotationcomments"], w, r) {
		return
	}
	comments := []m.AnnotationComment{}
	if u.CheckErrorCode(u.GetConnection().Set("gorm:auto_preload", true).Find(&comments).Error, w) {
		return
	}
	u.Respond(w, comments)
}
