package tag

import (
	"net/http"

	u "restapi/utils"
)

// GetTags receive request to get all tags in database
func GetTags(w http.ResponseWriter, r *http.Request) {
	tag := &[]Tag{}
	err := u.GetConnection().Find(&tag).Error
	if err != nil {
		http.Error(w, err.Error(), 404)
		return
	}
	u.Respond(w, tag)
}
