package organization

import (
	"net/http"

	// import pq driver
	_ "github.com/lib/pq"

	u "restapi/utils"
)

// GetOrganizations receive request to get all organizations in database
func GetOrganizations(w http.ResponseWriter, r *http.Request) {
	organization := &[]Organization{}
	err := u.GetConnection().Find(&organization).Error
	if err != nil {
		http.Error(w, err.Error(), 404)
		return
	}
	u.Respond(w, organization)
}
