package managers

import (
	"encoding/json"
	"net/http"
	d "restapi/dtos"
	m "restapi/models"
	u "restapi/utils"
	"time"
)

// CreateCommentOnInterval create comment on an annotation
func CreateCommentOnInterval(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("POST", u.CheckRoutes["intervalcomment"], w, r) {
		return
	}
	var c d.IntervalComment
	err := json.NewDecoder(r.Body).Decode(&c)
	if err != nil || c.Comment == nil || c.IntervalID == nil || c.UserID == nil {
		http.Error(w, "Bad args", 204)
		return
	}
	db := u.GetConnection().Set("gorm:auto_preload", true)
	intervalcomment := m.IntervalComment{Comment: *c.Comment, IntervalID: *c.IntervalID, UserID: *c.UserID, Date: time.Now()}
	if u.CheckErrorCode(db.Create(&intervalcomment).Error, w) {
		return
	}
	u.Respond(w, intervalcomment)
}
