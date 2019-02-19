package managers

import (
	"net/http"
	m "restapi/models"
	u "restapi/utils"

	"github.com/gorilla/mux"
)

// GetAllIntervalsComments list all comments of intervals
func GetAllIntervalsComments(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("GET", u.CheckRoutes["intervalscomments"], w, r) {
		return
	}
	comments := []m.IntervalComment{}
	if u.CheckErrorCode(u.GetConnection().Set("gorm:auto_preload", true).Find(&comments).Error, w) {
		return
	}
	u.Respond(w, comments)
}

// GetCommentOnIntervalByID get comment of an interval
func GetCommentOnIntervalByID(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("GET", u.CheckRoutes["interval"], w, r) {
		return
	}
	vars := mux.Vars(r)
	if len(vars) != 1 || !u.IsStringInt(vars["id"]) {
		http.Error(w, "Bad args", 204)
		return
	}
	db := u.GetConnection().Set("gorm:auto_preload", true)
	intervalcomment := []m.IntervalComment{}
	if u.CheckErrorCode(db.Where("interval_id = ?", vars["id"]).Find(&intervalcomment).Error, w) {
		return
	}
	u.Respond(w, intervalcomment)
}
