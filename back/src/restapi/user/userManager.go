package user

import (
	"encoding/json"
	"net/http"

	u "restapi/utils"

	"github.com/gorilla/mux"
)

// CreateUser function which receive a POST request and return a fresh-new user
func CreateUser(w http.ResponseWriter, r *http.Request) {
	db := u.GetConnection()
	user := Profile{}
	json.NewDecoder(r.Body).Decode(&user)

	err := db.Preload("Role").Create(&user).Error
	if err != nil {
		http.Error(w, err.Error(), 403)
		return
	}

	user.RoleID = nil

	u.Respond(w, user)
}

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

// Find user by ID using GET Request
func FindUserByID(w http.ResponseWriter, r *http.Request) {
	user := Profile{}
	vars := mux.Vars(r)
	err := u.GetConnection().Preload("Role").Where("is_active = ?", true).First(&user, vars["id"]).Error
	if err != nil {
		http.Error(w, err.Error(), 404)
		return
	}

	user.RoleID = nil

	u.Respond(w, user)
}


// DeleteUser disable user give in URL information (IsActive -> false)
func DeleteUser(w http.ResponseWriter, r *http.Request) {
	db := u.GetConnection()
	user := Profile{}
	vars := mux.Vars(r)

	err := db.First(&user, vars["id"]).Error
	if err != nil {
		http.Error(w, err.Error(), 404)
		return
	}
	user.IsActive = false
	db.Save(&user)
  
 
// ModifyUser modifies an annotation
func ModifyUser(w http.ResponseWriter, r *http.Request) {
	db := u.GetConnection()
	user := Profile{}
	json.NewDecoder(r.Body).Decode(&user)

	err := db.Save(&user).Error
	if err != nil {
		http.Error(w, err.Error(), 400)
		return
	}

	user.RoleID = nil

	u.Respond(w, user)
}
