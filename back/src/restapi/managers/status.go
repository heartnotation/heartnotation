package managers

import (
	"encoding/json"
	"net/http"
	d "restapi/dtos"
	m "restapi/models"
	u "restapi/utils"
	"time"
)

// CreateStatus create a status
func CreateStatus(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("POST", u.CheckRoutes["status"], w, r) {
		return
	}
	var s d.Status
	json.NewDecoder(r.Body).Decode(&s)
	if s.EnumStatusID == nil || s.UserID == nil || s.AnnotationID == nil {
		http.Error(w, "invalid args", 204)
		return
	}
	db := u.GetConnection().Set("gorm:auto_preload", true)
	status := m.Status{EnumstatusID: s.EnumStatusID, UserID: s.UserID, AnnotationID: s.AnnotationID, Date: time.Now()}
	if u.CheckErrorCode(db.Create(&status).Error, w) {
		return
	}
	u.Respond(w, status)
}
