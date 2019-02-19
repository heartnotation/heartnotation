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

// GetAllAnnotationComment list all comments of annotations
func GetAllAnnotationComment(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("GET", u.CheckRoutes["annotation"], w, r) {
		return
	}
	comments := []m.AnnotationComment{}
	if u.CheckErrorCode(u.GetConnection().Set("gorm:auto_preload", true).Find(&comments).Error, w) {
		return
	}
	u.Respond(w, comments)
}

// GetCommentsOnAnnotationByID get comment of an annotation
func GetCommentsOnAnnotationByID(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("GET", u.CheckRoutes["annotation"], w, r) {
		return
	}
	vars := mux.Vars(r)
	if len(vars) != 1 || !u.IsStringInt(vars["id"]) {
		http.Error(w, "Bad args", 204)
		return
	}
	db := u.GetConnection().Set("gorm:auto_preload", true)
	annotationcomment := []m.AnnotationComment{}
	if u.CheckErrorCode(db.Where("annotation_id = ?", vars["id"]).Find(&annotationcomment).Error, w) {
		return
	}
	u.Respond(w, annotationcomment)
}

// CreateCommentOnAnnotation create comment on an annotation
func CreateCommentOnAnnotation(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("POST", u.CheckRoutes["annotation"], w, r) {
		return
	}
	var i d.AnnotationComments
	err := json.NewDecoder(r.Body).Decode(&i)
	if err != nil || i.Comment == nil || i.AnnotationID == nil || i.UserID == nil {
		http.Error(w, "Bad args", 204)
		return
	}
	db := u.GetConnection().Set("gorm:auto_preload", true)
	annotationcomment := m.AnnotationComment{Comment: *i.Comment, AnnotationID: *i.AnnotationID, UserID: *i.UserID, Date: time.Now()}
	if u.CheckErrorCode(db.Create(&annotationcomment).Error, w) {
		return
	}
	u.Respond(w, annotationcomment)
}
