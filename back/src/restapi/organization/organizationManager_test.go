package organization

import (
	"restapi/utils"
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
