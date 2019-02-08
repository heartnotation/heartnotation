package user

import (
	"restapi/utils"
	"testing"
)

func TestGetUserByIdMethod(t *testing.T) {
	utils.CheckMethod("GET", "/users/", FindUserByID, t)
}

func TestGetUserByIdPath(t *testing.T) {
	utils.CheckPath("GET", "/users/", FindUserByID, t)
}

func TestGetUserByIdPayload(t *testing.T) {
	utils.CheckPayload("GET", "/users/", FindUserByID, "id", utils.CheckPayloadInt, t)
}

func TestDeleteUserByIdMethod(t *testing.T) {
	utils.CheckMethod("DELETE", "/users/", DeleteUser, t)
}

func TestDeleteUserByIdPath(t *testing.T) {
	utils.CheckPath("DELETE", "/users/", DeleteUser, t)
}

func TestDeleteUserByIdPayload(t *testing.T) {
	utils.CheckPayload("DELETE", "/users/", DeleteUser, "id", utils.CheckPayloadInt, t)
}
