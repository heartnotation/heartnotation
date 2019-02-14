package interval

import (
	"encoding/json"
	"net/http"
	t "restapi/tag"
	u "restapi/utils"
	"time"
)

// GetIntervals get all intervals
func GetIntervals(w http.ResponseWriter, r *http.Request) {
	interval := &[]Interval{}
	if u.CheckErrorCode(u.GetConnection().Set("gorm:auto_preload", true).Find(&interval).Error, w) {
		return
	}
	u.Respond(w, interval)
}

// CreateInterval create an interval
func CreateInterval(w http.ResponseWriter, r *http.Request) {
	var i Payload
	err := json.NewDecoder(r.Body).Decode(&i)
	if err != nil || i.Start >= i.End || len(i.TagsID) == 0 {
		http.Error(w, "Bad request (client)", 204)
		return
	}
	tags := []t.Tag{}
	db := u.GetConnection()
	if u.CheckErrorCode(db.Find(&tags, i.TagsID).Error, w) {
		return
	}
	if len(tags) != len(i.TagsID) {
		http.Error(w, "Bad request (client)", 204)
		return
	}
	interval := Interval{TimestampStart: i.Start, TimestampEnd: i.End, IsActive: true, Tags: tags}
	if u.CheckErrorCode(db.Create(&interval).Error, w) {
		return
	}
}

// Comments get all comments of every interval
func Comments(w http.ResponseWriter, r *http.Request) {
	c := []Comment{}
	if u.CheckErrorCode(u.GetConnection().Set("gorm:auto_preload", true).Find(&c).Error, w) {
		return
	}
	u.Respond(w, c)
}

// CreateComment create an interval and
func CreateComment(w http.ResponseWriter, r *http.Request) {
	var i Payload
	err := json.NewDecoder(r.Body).Decode(&i)
	if err != nil || i.ID != 0 {
		http.Error(w, "Bad args", 204)
		return
	}
	c := Comment{AnnotationID: i.AnnotationID, IntervalID: i.ID, UserID: i.UserID, Comment: i.Comment, Date: time.Now()}
	db := u.GetConnection()
	if u.CheckErrorCode(db.Create(&c).Error, w) {
		return
	}
}

// CreateAll create full info interval
func CreateAll(w http.ResponseWriter, r *http.Request) {
	var i Payload
	err := json.NewDecoder(r.Body).Decode(&i)
	if err != nil || i.Start >= i.End || len(i.TagsID) == 0 {
		http.Error(w, "Bad request (client)", 204)
		return
	}
	tags := []t.Tag{}
	db := u.GetConnection()
	if u.CheckErrorCode(db.Find(&tags, i.TagsID).Error, w) {
		return
	}
	if len(tags) != len(i.TagsID) {
		http.Error(w, "Bad request (client)", 204)
		return
	}
	interval := Interval{TimestampStart: i.Start, TimestampEnd: i.End, IsActive: true, Tags: tags}
	if u.CheckErrorCode(db.Create(&interval).Error, w) {
		return
	}
	c := Comment{AnnotationID: i.AnnotationID, IntervalID: interval.ID, UserID: i.UserID, Comment: i.Comment, Date: time.Now()}
	if u.CheckErrorCode(db.Create(&c).Error, w) {
		return
	}
}
