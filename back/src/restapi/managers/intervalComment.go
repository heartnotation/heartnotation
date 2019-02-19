package managers

import (
	"encoding/json"
	"net/http"
	d "restapi/dtos"
	m "restapi/models"
	u "restapi/utils"
	"time"

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

// CreateCommentOnInterval create comment on an annotation
func CreateCommentOnInterval(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("POST", u.CheckRoutes["intervalcomments"], w, r) {
		return
	}
	var c d.IntervalComment
	err := json.NewDecoder(r.Body).Decode(&c)
	if err != nil || c.Comment == nil || c.IntervalID == nil || c.UserID == nil {
		http.Error(w, "Bad args", 204)
		return
	}
	db := u.GetConnection().Set("gorm:auto_preload", true)
	intervalcomment := m.IntervalComment{Comment: *c.Comment, IntervalID: *c.IntervalID, UserID: *c.UserID, Date: time.Now()}
	if u.CheckErrorCode(db.Create(&intervalcomment).Error, w) {
		return
	}
	u.Respond(w, intervalcomment)
}
