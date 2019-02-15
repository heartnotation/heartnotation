package interval

import (
	"encoding/json"
	"net/http"
	t "restapi/tag"
	u "restapi/utils"
	"time"
)

// GetIntervalTag get all intervals
func GetIntervalTag(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("GET", u.CheckRoutes["intervalstag"], w, r) {
		return
	}
	interval := []Tag{}
	if u.CheckErrorCode(u.GetConnection().Set("gorm:auto_preload", true).Find(&interval).Error, w) {
		return
	}
	u.Respond(w, interval)
}

// CreateIntervalTag create an interval
func CreateIntervalTag(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("POST", u.CheckRoutes["intervalstag"], w, r) {
		return
	}
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
	interval := Tag{TimestampStart: i.Start, TimestampEnd: i.End, IsActive: true, Tags: tags}
	if u.CheckErrorCode(db.Create(&interval).Error, w) {
		return
	}
}

// GetIntervalComment get all comments of every interval
func GetIntervalComment(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("GET", u.CheckRoutes["intervalscomment"], w, r) {
		return
	}
	c := []Comment{}
	if u.CheckErrorCode(u.GetConnection().Set("gorm:auto_preload", true).Find(&c).Error, w) {
		return
	}
	u.Respond(w, c)
}

// CreateIntervalComment create an interval and
func CreateIntervalComment(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("POST", u.CheckRoutes["intervalscomment"], w, r) {
		return
	}
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

// GetInterval get full info interval
func GetInterval(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("GET", u.CheckRoutes["intervals"], w, r) {
		return
	}
	i := []Interval{}
	if u.CheckErrorCode(u.GetConnection().Set("gorm:auto_preload", true).Find(&i).Error, w) {
		return
	}
	u.Respond(w, i)
}

// CreateInterval create full info interval
func CreateInterval(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("POST", u.CheckRoutes["intervals"], w, r) {
		return
	}
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
	interval := Tag{TimestampStart: i.Start, TimestampEnd: i.End, IsActive: true, Tags: tags}
	if u.CheckErrorCode(db.Create(&interval).Error, w) {
		return
	}
	c := Comment{AnnotationID: i.AnnotationID, IntervalID: interval.ID, UserID: i.UserID, Comment: i.Comment, Date: time.Now()}
	if u.CheckErrorCode(db.Create(&c).Error, w) {
		return
	}
}
