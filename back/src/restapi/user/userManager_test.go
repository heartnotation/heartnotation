package user

import (
	"restapi/utils"
	u "restapi/utils"
	"strings"
	"testing"
)

func TestGetUserByIdMethod(t *testing.T) {
	utils.CheckMethod("GET", u.CheckRoutes["users"], FindUserByID, t)
}

func TestGetUserByIdPath(t *testing.T) {
	utils.CheckPath("GET", u.CheckRoutes["users"], FindUserByID, t)
}

func TestDeleteUserByIdMethod(t *testing.T) {
	utils.CheckMethod("DELETE", u.CheckRoutes["users"], DeleteUser, t)
}

func TestDeleteUserByIdPath(t *testing.T) {
	utils.CheckPath("DELETE", u.CheckRoutes["users"], DeleteUser, t)
}

func TestReadUsers(t *testing.T) {
	if strings.TrimSpace(utils.ReadTest("http://localhost:8000/users")) != `[{"id":1,"mail":"rolex@gmail.com","role":{"id":3,"name":"Admin","is_active":true},"role_id":3,"is_active":true},{"id":2,"mail":"marvin@gmail.com","role":{"id":1,"name":"Annotateur","is_active":true},"role_id":1,"is_active":true},{"id":3,"mail":"sophie@gmail.com","role":{"id":2,"name":"Gestionnaire","is_active":true},"role_id":2,"is_active":true}]` {
		t.Error("Expected content", `[{"id":1,"mail":"rolex@gmail.com","role":{"id":3,"name":"Admin","is_active":true},"role_id":3,"is_active":true},{"id":2,"mail":"marvin@gmail.com","role":{"id":1,"name":"Annotateur","is_active":true},"role_id":1,"is_active":true},{"id":3,"mail":"sophie@gmail.com","role":{"id":2,"name":"Gestionnaire","is_active":true},"role_id":2,"is_active":true}]`)
	}
}
