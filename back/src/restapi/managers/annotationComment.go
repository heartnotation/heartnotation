package managers

import (
	"encoding/json"
	"net/http"
	d "restapi/dtos"
	m "restapi/models"
	u "restapi/utils"
	"time"

	c "github.com/gorilla/context"
	"github.com/gorilla/mux"
)

// CreateCommentOnAnnotation create comment on an annotation
func CreateCommentOnAnnotation(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("POST", u.CheckRoutes["annotationscomment"], w, r) {
		return
	}
	var i d.AnnotationComments
	err := json.NewDecoder(r.Body).Decode(&i)

	contextUser := c.Get(r, "user").(*m.User)

	if err != nil || i.Comment == nil || i.AnnotationID == nil {
		http.Error(w, "Bad args", 204)
		return
	}
	db := u.GetConnection()
	annotationcomment := m.AnnotationComment{Comment: *i.Comment, AnnotationID: *i.AnnotationID, UserID: contextUser.ID, Date: time.Now()}
	// Insert annotation comment in database
	if u.CheckErrorCode(db.Create(&annotationcomment).Error, w) {
		return
	}
	// Populate response with the user object
	if u.CheckErrorCode(db.First(&annotationcomment.User, annotationcomment.UserID).Error, w) {
		return
	}
	u.Respond(w, annotationcomment)
}

// FindCommentsByAnnotationID
func FindCommentsByAnnotationID(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("GET", u.CheckRoutes["annotationscomments"], w, r) {
		return
	}
	vars := mux.Vars(r)
	var err error
	annotationComments := []m.AnnotationComment{}

	db := u.GetConnection().Preload("User")
	err = db.Where("annotation_id = ?", vars["id"]).Find(&annotationComments).Error
	if err != nil {
		http.Error(w, err.Error(), 404)
		return
	}

	u.Respond(w, annotationComments)
}
