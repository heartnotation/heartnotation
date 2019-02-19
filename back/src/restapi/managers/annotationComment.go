package managers

import (
	"net/http"
	m "restapi/models"
	u "restapi/utils"

	"github.com/gorilla/mux"
)

// GetAllAnnotationComment list all comments of annotations
func GetAllAnnotationComment(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("GET", u.CheckRoutes["annotationscomments"], w, r) {
		return
	}
	comments := []m.AnnotationComment{}
	if u.CheckErrorCode(u.GetConnection().Set("gorm:auto_preload", true).Find(&comments).Error, w) {
		return
	}
	u.Respond(w, comments)
}

// GetCommentOnAnnotationByID get comment of an annotation
func GetCommentOnAnnotationByID(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("GET", u.CheckRoutes["annotationcomments"], w, r) {
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

func CreateCommentOnAnnotation(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("POST", u.CheckRoutes["annotationcomments"], w, r) {
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
