package organization

import (
	"restapi/utils"
	"strings"
	"testing"
)

func TestGetSignalByIdMethod(t *testing.T) {
	utils.CheckMethod("GET", "/signal/", GetOrganizations, t)
}

func TestGetSignalByIdPath(t *testing.T) {
	utils.CheckPath("GET", "/signal/", GetOrganizations, t)
}

func TestGetSignalByIdPayload(t *testing.T) {
	utils.CheckPayload("GET", "/signal/", GetOrganizations, "id", utils.CheckPayloadInt, t)
}

func TestReadOrganizations(t *testing.T) {
	if strings.TrimSpace(utils.ReadTest("http://localhost:8000/organizations")) != `[{"id":1,"name":"Cardiologs","is_active":true},{"id":2,"name":"Podologs","is_active":true},{"id":3,"name":"Heartnotalogs","is_active":true}]` {
		t.Error("Expected content", `[{"id":1,"name":"Cardiologs","is_active":true},{"id":2,"name":"Podologs","is_active":true},{"id":3,"name":"Heartnotalogs","is_active":true}]`)
	}
}
