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
	if u.CheckErrorCode(u.GetConnection().Preload("Tags").Find(&intervals).Error, w) {
		return
	}
	u.Respond(w, intervals)
}

// FindIntervalByID get an interval bi ID
func FindIntervalByID(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("GET", u.CheckRoutes["interval"], w, r) {
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
	if u.CheckMethodPath("POST", u.CheckRoutes["interval"], w, r) {
		return
	}
	var i d.Interval
	err := json.NewDecoder(r.Body).Decode(&i)
	if err != nil || i.TimeStart == nil || i.TimeEnd == nil || i.AnnotationID == nil && (*i.TimeStart > *i.TimeEnd) {
		http.Error(w, "Bad args", 204)
		return
	}
	c := m.Interval{TimeStart: *i.TimeStart, TimeEnd: *i.TimeEnd, AnnotationID: *i.AnnotationID}
	if u.CheckErrorCode(u.GetConnection().Create(&c).Error, w) {
		return
	}
	u.Respond(w, c)
}

// RemoveIntervalByID Remove an interval by his ID
func RemoveIntervalByID(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("DELETE", u.CheckRoutes["interval"], w, r) {
		return
	}
	interval := m.Interval{}
	v := mux.Vars(r)
	if len(v) != 1 || !u.IsStringInt(v["id"]) {
		http.Error(w, "Bad args", 204)
		return
	}
	db := u.GetConnection()
	if u.CheckErrorCode(db.First(&interval, v["id"]).Error, w) || u.CheckErrorCode(db.Delete(&interval).Error, w) {
		return
	}
}

// AddTagsOnIntervalByID create a tag on an interval
func AddTagsOnIntervalByID(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("POST", u.CheckRoutes["interval"], w, r) {
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
	if len(tags) != len(i.Tags) {
		http.Error(w, "Bad request (client)", 204)
		return
	}
	interval := m.Interval{}
	if u.CheckErrorCode(db.Find(&interval, v["id"]).Error, w) {
		return
	}
	db.Model(&interval).Association("Tags").Replace(tags)
}
