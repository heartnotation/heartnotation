package managers

import (
	"encoding/json"
	"net/http"
	d "restapi/dtos"
	m "restapi/models"
	u "restapi/utils"
	"time"

	c "github.com/gorilla/context"
)

// CreateCommentOnInterval create comment on an interval
func CreateCommentOnInterval(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("POST", u.CheckRoutes["intervalscomments"], w, r) {
		return
	}
	var icp d.IntervalCommentPayload
	err := json.NewDecoder(r.Body).Decode(&icp)

	contextUser := c.Get(r, "user").(*m.User)

	if err != nil || icp.Comment == nil || icp.IntervalID == nil {
		http.Error(w, "Bad args", 204)
		return
	}

	db := u.GetConnection()
	intervalcomment := m.IntervalComment{Comment: *icp.Comment, IntervalID: *icp.IntervalID, UserID: contextUser.ID, Date: time.Now()}
	// Insert interval comment in database
	if u.CheckErrorCode(db.Create(&intervalcomment).Error, w) {
		return
	}
	// Populate response with the user object
	if u.CheckErrorCode(db.First(&intervalcomment.User, intervalcomment.UserID).Error, w) {
		return
	}
	u.Respond(w, intervalcomment)
}
