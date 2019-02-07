package user

import (
	"net/http"

	u "restapi/utils"
)

// GetAllUsers return users from database
func GetAllUsers(w http.ResponseWriter, r *http.Request) {
	users := &[]Profile{}
	err := u.GetConnection().Preload("Role").Find(&users).Error
	if err != nil {
		http.Error(w, err.Error(), 404)
		return
	}
	u.Respond(w, users)
}
