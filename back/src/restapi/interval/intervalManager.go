package interval

import (
	"encoding/json"
	"log"
	"net/http"
	t "restapi/tag"
	u "restapi/utils"
	"time"

	"github.com/gorilla/mux"
)

// GetInterval get an interval
func GetInterval(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("GET", u.CheckRoutes["intervals"], w, r) {
		return
	}
	interval := []Interval{}
	if u.CheckErrorCode(u.GetConnection().Set("gorm:auto_preload", true).Find(&interval).Error, w) {
		return
	}
	u.Respond(w, interval)
}

// CreateInterval create an interval
func CreateInterval(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("POST", u.CheckRoutes["intervals"], w, r) {
		return
	}
	var i Payload
	err := json.NewDecoder(r.Body).Decode(&i)
	if err != nil || i.Start == nil || i.End == nil {
		http.Error(w, "Bad args", 204)
		return
	}
	c := Interval{TimestampStart: *i.Start, TimestampEnd: *i.End}
	db := u.GetConnection()
	if u.CheckErrorCode(db.Create(&c).Error, w) {
		return
	}
	u.Respond(w, c)
}

// CreateIntervalTag create an interval
func CreateIntervalTag(w http.ResponseWriter, r *http.Request) {
	var i Payload
	err := json.NewDecoder(r.Body).Decode(&i)
	if err != nil || i.TagsID == nil || len(i.TagsID) == 0 || i.ID == nil || i.Start == nil || i.End == nil {
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
	interval := Interval{ID: *i.ID, Tags: tags, TimestampStart: *i.Start, TimestampEnd: *i.End}
	if u.CheckErrorCode(db.Save(&interval).Error, w) {
		return
	}
}

// GetIntervalComment get an interval
func GetIntervalComment(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("GET", u.CheckRoutes["intervalscomment"], w, r) {
		return
	}
	v := mux.Vars(r)
	log.Println(len(v["id"]))
	log.Println(len(v))
	log.Println(!u.IsStringInt(v["id"]))
	if len(v) != 1 || len(v["id"]) == 0 || !u.IsStringInt(v["id"]) {
		http.Error(w, "Bad request", 400)
		return
	}
	log.Println("coucou")
	interval := Interval{}
	if u.CheckErrorCode(u.GetConnection().Set("gorm:auto_preload", true).First(&interval, v["id"]).Error, w) {
		log.Println("là")
		return
	}
	comment := []Comment{}
	if u.CheckErrorCode(u.GetConnection().Set("gorm:auto_preload", true).Where("interval_id = ?", v["id"]).Find(&comment).Error, w) {
		log.Println("li")
		return
	}
	u.Respond(w, IntCom{Interval: interval, Comment: comment})
}

// CreateComment create an interval and
func CreateComment(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("POST", u.CheckRoutes["intervalscomment"], w, r) {
		return
	}
	var i Payload
	err := json.NewDecoder(r.Body).Decode(&i)
	log.Println(*i.Comment)
	if err != nil || i.Comment == nil || i.AnnotationID == nil || i.UserID == nil || i.ID == nil {
		http.Error(w, "Bad args", 204)
		return
	}
	c := Comment{AnnotationID: *i.AnnotationID, IntervalID: i.ID, UserID: *i.UserID, Comment: *i.Comment, Date: time.Now()}
	db := u.GetConnection()
	if u.CheckErrorCode(db.Create(&c).Error, w) {
		return
	}
}
