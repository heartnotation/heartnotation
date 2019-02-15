package managers

import (
	"net/http"
	m "restapi/models"
	u "restapi/utils"
)

// GetAllAnnotationComment list all comments of annotations
func GetAllAnnotationComment(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("GET", u.CheckRoutes["annotationscomments"], w, r) {
		return
	}
	comments := []m.AnnotationComment{}
	if u.CheckErrorCode(u.GetConnection().Set("gorm:auto_preload", true).Find(&comments).Error, w) {
		return
	}
	u.Respond(w, comments)
}
