package managers

import (
	"encoding/json"
	"net/http"
	d "restapi/dtos"
	m "restapi/models"
	u "restapi/utils"
	"strings"

	"github.com/gorilla/mux"
)

// GetAllUsers users
func GetAllUsers(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("GET", u.CheckRoutes["users"], w, r) {
		return
	}
	users := []m.User{}
	if u.CheckErrorCode(u.GetConnection().Preload("Organizations").Preload("Role").Find(&users).Error, w) {
		return
	}
	u.Respond(w, users)
}

// CreateUser function which receive a POST request and return a fresh-new user
func CreateUser(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("POST", u.CheckRoutes["user"], w, r) {
		return
	}
	var a d.User
	json.NewDecoder(r.Body).Decode(&a)
	if a.Mail == nil || a.OrganizationsID == nil || a.RoleID == 0 {
		http.Error(w, "invalid args", 400)
		return
	}
	db := u.GetConnection()

	existingUsers := []m.User{}
	db.Find(&existingUsers)

	for _, user := range existingUsers {
		if strings.EqualFold(user.Mail, *a.Mail) {
			http.Error(w, "Mail address already in use", http.StatusConflict)
			return
		}
	}

	organizations := []m.Organization{}
	role := m.Role{}
	if u.CheckErrorCode(db.Find(&organizations, a.OrganizationsID).Error, w) {
		return
	}
	if u.CheckErrorCode(db.Find(&role, a.RoleID).Error, w) {
		return
	}
	if len(organizations) != len(a.OrganizationsID) || role.ID != a.RoleID {
		http.Error(w, "invalid args", 204)
		return
	}
	user := m.User{Mail: *a.Mail, RoleID: role.ID, Organizations: organizations, IsActive: true}
	if u.CheckErrorCode(db.Create(&user).Error, w) {
		return
	}
	u.Respond(w, user)
}

// FindUserByID user by ID using GET Request
func FindUserByID(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("GET", u.CheckRoutes["user"], w, r) {
		return
	}
	user := m.User{}
	vars := mux.Vars(r)
	if u.CheckErrorCode(u.GetConnection().Set("gorm:auto_preload", true).Where("is_active = ?", true).First(&user, vars["id"]).Error, w) {
		return
	}
	u.Respond(w, user)
}

// DeleteUser disable user give in URL information (IsActive -> false)
func DeleteUser(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("DELETE", u.CheckRoutes["user"], w, r) {
		return
	}
	user := m.User{}
	v := mux.Vars(r)
	if len(v) != 1 || !u.IsStringInt(v["id"]) {
		http.Error(w, "Bad request", 400)
		return
	}
	db := u.GetConnection()
	if u.CheckErrorCode(db.First(&user, v["id"]).Error, w) {
		return
	}
	db.Model(&user).Update("is_active", false)
}

// UpdateUser modifies a user
func UpdateUser(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("PUT", u.CheckRoutes["user"], w, r) {
		return
	}
	var a d.User
	user := m.User{}
	organizations := []m.Organization{}
	role := m.Role{}
	json.NewDecoder(r.Body).Decode(&a)
	if a.ID == nil {
		http.Error(w, "bad argues", 204)
		return
	}
	db := u.GetConnection().Set("gorm:auto_preload", true)
	if u.CheckErrorCode(db.First(&user, *a.ID).Error, w) {
		return
	}
	if u.CheckErrorCode(db.Find(&role, a.RoleID).Error, w) {
		return
	}
	if role.ID != a.RoleID {
		http.Error(w, "bad argues", 204)
		return
	}
	db.Model(&user).Association("Role").Replace(role.ID)
	if a.OrganizationsID != nil {
		if u.CheckErrorCode(db.Find(&organizations, a.OrganizationsID).Error, w) {
			return
		}
		if len(organizations) != len(a.OrganizationsID) {
			http.Error(w, "bad argues", 204)
			return
		}
		db.Model(&user).Association("Organizations").Replace(organizations)
	}
	if a.Mail != nil {
		user.Mail = *a.Mail
	}
	if u.CheckErrorCode(db.Save(user).Error, w) {
		return
	}
	u.Respond(w, user)
}
