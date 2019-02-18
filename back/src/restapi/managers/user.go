package managers

import (
	"encoding/json"
	"log"
	"net/http"
	d "restapi/dtos"
	m "restapi/models"
	u "restapi/utils"

	"github.com/gorilla/mux"
)

// GetAllUsers users
func GetAllUsers(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("GET", u.CheckRoutes["users"], w, r) {
		return
	}
	users := []m.User{}
	if u.CheckErrorCode(u.GetConnection().Set("gorm:auto_preload", true).Find(&users).Error, w) {
		return
	}
	u.Respond(w, users)
}

// CreateUser function which receive a POST request and return a fresh-new user
func CreateUser(w http.ResponseWriter, r *http.Request) {
	log.Println("b")
	if u.CheckMethodPath("POST", u.CheckRoutes["users"], w, r) {
		return
	}
	var a d.User
	json.NewDecoder(r.Body).Decode(&a)
	if a.Mail == nil || a.OrganizationsID == nil || a.RolesID == nil {
		http.Error(w, "invalid args", 204)
		return
	}
	db := u.GetConnection().Set("gorm:auto_preload", true)
	organizations := []m.Organization{}
	roles := []m.Role{}
	if u.CheckErrorCode(db.Find(&organizations, a.OrganizationsID).Error, w) {
		return
	}
	if u.CheckErrorCode(db.Find(&roles, a.RolesID).Error, w) {
		return
	}
	if len(organizations) != len(a.OrganizationsID) || len(roles) != len(a.RolesID) {
		http.Error(w, "invalid args", 204)
		return
	}
	user := m.User{Mail: *a.Mail, Roles: roles, Organizations: organizations, IsActive: true}
	if u.CheckErrorCode(db.Create(&user).Error, w) {
		return
	}
	u.Respond(w, user)
}

// Find user by ID using GET Request
func FindUserByID(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("GET", u.CheckRoutes["users"], w, r) {
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
	if u.CheckMethodPath("DELETE", u.CheckRoutes["users"], w, r) {
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
	user.IsActive = false
	db.Save(&user)
}

/*
// ModifyUser modifies an annotation
func ModifyUser(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("PUT", u.CheckRoutes["users"], w, r) {
		return
	}
	db := u.GetConnection().Set("gorm:auto_preload", true)
	var a d.User
	user := &m.User{}
	organizations := []m.Organization{}
	roles := []m.Role{}

	json.NewDecoder(r.Body).Decode(&a)

	if u.CheckErrorCode(db.First(&user).Error, w) {
		return
	}

	if u.CheckErrorCode(db.Find(&organizations, a.OrganizationsID).Error, w) {
		return
	}

	if u.CheckErrorCode(db.Find(&roles, a.RolesID).Error, w) {
		return
	}

	if len(organizations) != len(a.OrganizationsID) || len(roles) != len(a.RolesID) {
		http.Error(w, "Organization or role not found", 204)
		return
	}
	/*
		err = db.Where("user_id = ?", a.ID).Delete(&organizations).Error
		if err != nil {
			u.CheckErrorCode(err, w)
			return
		}

	user = &m.User{ID: *a.ID, Mail: *a.Mail, Roles: roles, Organizations: organizations, IsActive: true}

	if u.CheckErrorCode(db.Save(user).Error, w) {
		return
	}

	u.Respond(w, user)
}
*/
