package tag

import (
	"restapi/utils"
	u "restapi/utils"
	"strings"
	"testing"
)

func TestGetTagsMethod(t *testing.T) {
	utils.CheckMethod("GET", u.CheckRoutes["tags"], GetTags, t)
}

func TestGetTagsPath(t *testing.T) {
	utils.CheckPath("GET", u.CheckRoutes["tags"], GetTags, t)
}

func TestReadTags(t *testing.T) {
	if strings.TrimSpace(utils.ReadTest("http://localhost:8000/tags")) != `[{"id":1,"name":"Lungs on fire","color":"red","is_active":true},{"id":2,"name":"Lungs on water","color":"blue","is_active":true},{"id":3,"parent":{"id":2,"name":"Lungs on water","color":"blue","is_active":true},"name":"Weird lungs","color":"green","is_active":true}]` {
		t.Error("Expected content", `[{"id":1,"name":"Lungs on fire","color":"red","is_active":true},{"id":2,"name":"Lungs on water","color":"blue","is_active":true},{"id":3,"parent":{"id":2,"name":"Lungs on water","color":"blue","is_active":true},"name":"Weird lungs","color":"green","is_active":true}]`)
	}
}
