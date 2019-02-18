package managers

import (
	"encoding/json"
	"net/http"
	d "restapi/dtos"
	m "restapi/models"
	u "restapi/utils"

	"github.com/gorilla/mux"
)

// GetAllIntervals list all intervals
func GetAllIntervals(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("GET", u.CheckRoutes["intervals"], w, r) {
		return
	}
	intervals := []m.Interval{}
	if u.CheckErrorCode(u.GetConnection().Set("gorm:auto_preload", true).Find(&intervals).Error, w) {
		return
	}
	u.Respond(w, intervals)
}

// FindInterval get an interval
func FindIntervalById(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("GET", u.CheckRoutes["intervals"], w, r) {
		return
	}
	interval := []m.Interval{}
	vars := mux.Vars(r)
	if u.CheckErrorCode(u.GetConnection().Set("gorm:auto_preload", true).Where("is_active = ?", true).Find(&interval, vars["id"]).Error, w) {
		return
	}
	u.Respond(w, interval)
}

// CreateInterval create an interval
func CreateInterval(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("POST", u.CheckRoutes["intervals"], w, r) {
		return
	}
	var i d.Interval
	err := json.NewDecoder(r.Body).Decode(&i)
	if err != nil || i.TimeStart == nil || i.TimeEnd == nil {
		http.Error(w, "Bad args", 204)
		return
	}
	if u.CheckErrorCode(u.GetConnection().Create(&m.Interval{TimestampStart: *i.TimeStart, TimestampEnd: *i.TimeEnd}).Error, w) {
		return
	}
	u.Respond(w, c)
}

// AddTagsOnIntervalById create a tag on an interval
func AddTagsOnIntervalById(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("POST", u.CheckRoutes["intervaltags"], w, r) {
		return
	}
	var i d.Interval
	err := json.NewDecoder(r.Body).Decode(&i)
	v := mux.Vars(r)
	if err != nil || i.Tags == nil || len(i.Tags) == 0 || i.ID == nil || len(v) != 1 || !u.IsStringInt(v["id"]) {
		http.Error(w, "Bad request (client)", 204)
		return
	}
	tags := []m.Tag{}
	db := u.GetConnection()
	if u.CheckErrorCode(db.Find(&tags, i.Tags).Error, w) {
		return
	}
	if len(tags) != len(i.TagsID) {
		http.Error(w, "Bad request (client)", 204)
		return
	}
	interval := m.Interval{}
	if u.CheckErrorCode(db.Find(&interval, v["id"]).Error, w) {
		return
	}
	db.Model(&interval).Association("Tags").Replace(tags)
}
