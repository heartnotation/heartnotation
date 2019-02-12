package tag

import (
	"restapi/utils"
	"strings"
	"testing"
)

func TestReadTags(t *testing.T) {
	if strings.TrimSpace(utils.ReadTest("http://localhost:8000/tags")) != `[{"id":1,"name":"Lungs on fire","color":"red","is_active":true},{"id":2,"name":"Lungs on water","color":"blue","is_active":true},{"id":3,"parent":{"id":2,"name":"Lungs on water","color":"blue","is_active":true},"name":"Weird lungs","color":"green","is_active":true}]` {
		t.Error("Expected content", `[{"id":1,"name":"Lungs on fire","color":"red","is_active":true},{"id":2,"name":"Lungs on water","color":"blue","is_active":true},{"id":3,"parent":{"id":2,"name":"Lungs on water","color":"blue","is_active":true},"name":"Weird lungs","color":"green","is_active":true}]`)
	}
}
