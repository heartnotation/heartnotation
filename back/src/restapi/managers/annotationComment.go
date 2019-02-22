package managers

import (
	"encoding/json"
	"net/http"
	d "restapi/dtos"
	m "restapi/models"
	u "restapi/utils"
	"time"
)

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
