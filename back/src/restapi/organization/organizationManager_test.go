package organization

import (
	"restapi/utils"
	u "restapi/utils"
	"strings"
	"testing"
)

func TestGetOrganizationsMethod(t *testing.T) {
	utils.CheckMethod("GET", u.CheckRoutes["organizations"], GetOrganizations, t)
}

func TestGetOrganizationsPath(t *testing.T) {
	utils.CheckPath("GET", u.CheckRoutes["organizations"], GetOrganizations, t)
}

func TestReadOrganizations(t *testing.T) {
	if strings.TrimSpace(utils.ReadTest("http://localhost:8000/organizations")) != `[{"id":1,"name":"Cardiologs","is_active":true},{"id":2,"name":"Podologs","is_active":true},{"id":3,"name":"Heartnotalogs","is_active":true}]` {
		t.Error("Expected content", `[{"id":1,"name":"Cardiologs","is_active":true},{"id":2,"name":"Podologs","is_active":true},{"id":3,"name":"Heartnotalogs","is_active":true}]`)
	}
}
