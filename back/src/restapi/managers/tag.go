package managers

import (
	"encoding/json"
	"net/http"
	d "restapi/dtos"
	m "restapi/models"
	u "restapi/utils"

	"github.com/gorilla/mux"
)

// GetAllTags list all tags
func GetAllTags(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("GET", u.CheckRoutes["tags"], w, r) {
		return
	}
	tags := []m.Tag{}
	if u.CheckErrorCode(u.GetConnection().Set("gorm:auto_preload", true).Find(&tags).Error, w) {
		return
	}
	u.Respond(w, tags)
}

// CreateTag create a tag
func CreateTag(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("POST", u.CheckRoutes["tag"], w, r) {
		return
	}
	var i d.Tag
	err := json.NewDecoder(r.Body).Decode(&i)
	if err != nil || i.Name == nil || i.Color == nil {
		http.Error(w, "Bad args", 204)
		return
	}
	t := m.Tag{ParentID: i.ParentID, Name: *i.Name, Color: *i.Color, IsActive: true}
	if u.CheckErrorCode(u.GetConnection().Create(&t).Error, w) {
		return
	}
	u.Respond(w, t)
}

// RemoveTagByID remove a tag by his id
func RemoveTagByID(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("DELETE", u.CheckRoutes["tag"], w, r) {
		return
	}
	t := m.Tag{}
	v := mux.Vars(r)
	if len(v) != 1 || !u.IsStringInt(v["id"]) {
		http.Error(w, "Bad args", 204)
		return
	}
	db := u.GetConnection()
	if u.CheckErrorCode(db.First(&t, v["id"]).Error, w) {
		return
	}
	db.Model(&t).Update("is_active", false)
}

// UpdateTagByID update a tag by his id
func UpdateTagByID(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("PUT", u.CheckRoutes["tag"], w, r) {
		return
	}
	var t d.Tag
	err := json.NewDecoder(r.Body).Decode(&t)
	if err != nil || (t.Color == nil && t.Name == nil && t.ID == nil && t.ParentID == nil) {
		http.Error(w, "Bad args", 204)
		return
	}
	db := u.GetConnection().Set("gorm:auto_preload", true)
	tag := m.Tag{}
	if u.CheckErrorCode(db.First(&tag, *t.ID).Error, w) {
		return
	}
	if t.Color != nil {
		tag.Color = *t.Color
	}
	if t.Name != nil {
		tag.Name = *t.Name
	}
	if t.ParentID != nil {
		tag.ParentID = t.ParentID
	}
	if u.CheckErrorCode(db.Save(&tag).Error, w) {
		return
	}
}
