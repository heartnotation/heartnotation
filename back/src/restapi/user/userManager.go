package user

import (
	"encoding/json"
	"net/http"

	o "restapi/organization"
	u "restapi/utils"

	"github.com/gorilla/mux"
)

// CreateUser function which receive a POST request and return a fresh-new user
func CreateUser(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("POST", u.CheckRoutes["users"], w, r) {
		return
	}
	db := u.GetConnection()
	var a dto
	json.NewDecoder(r.Body).Decode(&a)

	organizations := []o.Organization{}
	role := Role{}

	err := db.Where(a.OrganizationsID).Find(&organizations).Error
	if err != nil {
		u.CheckErrorCode(err, w)
		return
	}

	err = db.Where(a.RoleID).Find(&role).Error
	if err != nil {
		u.CheckErrorCode(err, w)
		return
	}

	if len(organizations) != len(a.OrganizationsID) {
		http.Error(w, "Organization not found", 204)
		return
	}

	user := &User{Mail: a.Mail, Role: role, Organizations: organizations, IsActive: true}

	err = db.Preload("Role").Create(&user).Error

	if err != nil {
		http.Error(w, err.Error(), 403)
		return
	}
	user.RoleID = nil
	u.Respond(w, user)
}

// GetAllUsers return users from database
func GetAllUsers(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("GET", u.CheckRoutes["users"], w, r) {
		return
	}
	users := &[]User{}
	err := u.GetConnection().Preload("Role").Preload("Organizations").Find(&users).Error
	if err != nil {
		http.Error(w, err.Error(), 404)
		return
	}

	for i := range *users {
		arr := *users
		arr[i].RoleID = nil
	}

	u.Respond(w, users)
}

// Find user by ID using GET Request
func FindUserByID(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("GET", u.CheckRoutes["users"], w, r) {
		return
	}
	user := User{}
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
	if u.CheckMethodPath("DELETE", u.CheckRoutes["users"], w, r) {
		return
	}
	db := u.GetConnection()
	user := User{}
	vars := mux.Vars(r)

	err := db.First(&user, vars["id"]).Error
	if err != nil {
		http.Error(w, err.Error(), 404)
		return
	}
	user.IsActive = false
	db.Save(&user)
}

// ModifyUser modifies an annotation
func ModifyUser(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("PUT", u.CheckRoutes["users"], w, r) {
		return
	}
	db := u.GetConnection()
	var a dto
	user := &User{}
	organizations := []o.Organization{}
	role := &Role{}
	organizationuser := OrganizationUser{}
	json.NewDecoder(r.Body).Decode(&a)

	err := db.Preload("Role").Preload("Organizations").First(&user).Error
	if err != nil {
		http.Error(w, err.Error(), 404)
		return
	}

	err = db.Where(a.OrganizationsID).Find(&organizations).Error
	if err != nil {
		u.CheckErrorCode(err, w)
		return
	}

	err = db.Where(a.RoleID).Find(&role).Error
	if err != nil {
		u.CheckErrorCode(err, w)
		return
	}

	if len(organizations) != len(a.OrganizationsID) {
		http.Error(w, "Organization not found", 204)
		return
	}

	if role == nil {
		role = &user.Role
	}

	if organizations == nil {
		organizations = user.Organizations
	}

	err = db.Where("user_id = ?", a.ID).Delete(&organizationuser).Error
	if err != nil {
		u.CheckErrorCode(err, w)
		return
	}

	user = &User{ID: a.ID, Mail: a.Mail, Role: *role, Organizations: organizations, IsActive: true}

	err = db.Preload("Role").Preload("Organizations").Save(user).Error
	if err != nil {
		http.Error(w, err.Error(), 400)
		return
	}

	user.RoleID = nil

	u.Respond(w, user)
}

// GetAllRoles return users from database
func GetAllRoles(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("GET", u.CheckRoutes["users"], w, r) {
		return
	}
	roles := &[]Role{}
	err := u.GetConnection().Where("is_active = ?", true).Find(&roles).Error
	if err != nil {
		http.Error(w, err.Error(), 404)
		return
	}
	u.Respond(w, roles)
}
