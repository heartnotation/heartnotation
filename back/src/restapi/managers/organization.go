package managers

import (
	"encoding/json"
	"net/http"
	d "restapi/dtos"
	m "restapi/models"
	u "restapi/utils"

	c "github.com/gorilla/context"
)

// GetAllOrganizations list all organizations
func GetAllOrganizations(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("GET", u.CheckRoutes["organizations"], w, r) {
		return
	}
	organizations := []m.Organization{}
	if u.CheckErrorCode(u.GetConnection().Find(&organizations).Error, w) {
		return
	}
	u.Respond(w, organizations)
}

// CreateOrganization handles POST request to create a new Organization
func CreateOrganization(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("POST", u.CheckRoutes["organizations"], w, r) {
		return
	}
	contextUser := c.Get(r, "user").(*m.User)

	//Only admins can create organizations
	if contextUser.Role.ID != 3 {
		http.Error(w, "This action is not permitted on the actual user", 403)
		return
	}

	payload := d.Organization{}
	json.NewDecoder(r.Body).Decode(&payload)

	db := u.GetConnection()

	existingOrga := []m.Organization{}
	newOrga := m.Organization{Name: payload.Name, IsActive: true}
	db.Where(&newOrga).Find(&existingOrga)

	if len(existingOrga) > 0 {
		http.Error(w, "An existing organization already have this name", http.StatusConflict)
		return
	}

	if u.CheckErrorCode(db.Create(&newOrga).Error, w) {
		return
	}
	u.Respond(w, &newOrga)
}

// ChangeOrganization handles PUT request to modify an Organization
func ChangeOrganization(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("PUT", u.CheckRoutes["organizations"], w, r) {
		return
	}
	contextUser := c.Get(r, "user").(*m.User)

	//Only admins can modify organizations
	if contextUser.Role.ID != 3 {
		http.Error(w, "This action is not permitted on the actual user", 403)
		return
	}

	payload := d.Organization{}
	json.NewDecoder(r.Body).Decode(&payload)

	if payload.ID == 0 {
		http.Error(w, "No ID provided", http.StatusBadRequest)
		return
	}

	db := u.GetConnection()
	existingOrga := []m.Organization{}
	changedOrga := m.Organization{ID: payload.ID, Name: payload.Name, IsActive: true}

	if u.CheckErrorCode(db.Find(&existingOrga, "name = ? AND id != ?", payload.Name, payload.ID).Error, w) {
		return
	}
	if len(existingOrga) > 0 {
		http.Error(w, "An existing organization already have this name", http.StatusConflict)
		return
	}

	if u.CheckErrorCode(db.Save(&changedOrga).Error, w) {
		return
	}
	u.Respond(w, &changedOrga)
}
