package tag

import (
	"net/http"

	u "restapi/utils"
)

// GetTags receive request to get all tags in database
func GetTags(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("GET", u.CheckRoutes["tags"], w, r) {
		return
	}
	tag := &[]Tag{}
	err := u.GetConnection().Preload("Parent").Find(&tag).Error
	if err != nil {
		http.Error(w, err.Error(), 404)
		return
	}

	for i := range *tag {
		arr := *tag
		arr[i].ParentID = nil
	}

	u.Respond(w, tag)
}
