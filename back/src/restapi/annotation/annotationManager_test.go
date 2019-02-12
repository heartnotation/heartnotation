package annotation

import (
	"restapi/utils"
	"strings"
	"testing"
)

func TestDeleteAnnotationMethod(t *testing.T) {
	utils.CheckMethod("DELETE", "/annotations/", DeleteAnnotation, t)
}

func TestDeleteAnnotationPath(t *testing.T) {
	utils.CheckPath("DELETE", "/annotations/", DeleteAnnotation, t)
}

func TestDeleteAnnotationPayload(t *testing.T) {
	utils.CheckPayload("DELETE", "/annotations/", DeleteAnnotation, "id", utils.CheckPayloadInt, t)
}

func TestGetAnnotationByIdMethod(t *testing.T) {
	utils.CheckMethod("GET", "/annotations/", FindAnnotationByID, t)
}

func TestGetAnnotationByIdPath(t *testing.T) {
	utils.CheckPath("GET", "/annotations/", FindAnnotationByID, t)
}

func TestGetAnnotationByIdPayload(t *testing.T) {
	utils.CheckPayload("GET", "/annotations/", FindAnnotationByID, "id", utils.CheckPayloadInt, t)
}

func TestReadAnnotations(t *testing.T) {
	if strings.TrimSpace(utils.ReadTest("http://localhost:8000/annotations")) != `[{"id":1,"name":"Annotation 1","organization":{"id":1,"name":"Cardiologs","is_active":true},"status":{"id":1,"name":"CREATED","is_active":true},"signal_id":1,"creation_date":"2004-10-19T10:23:54Z","edit_date":"2012-12-29T17:19:54Z","is_active":true,"is_editable":true},{"id":2,"name":"Annotation 2","organization":{"id":2,"name":"Podologs","is_active":true},"status":{"id":2,"name":"ASSIGNED","is_active":true},"signal_id":1,"creation_date":"2004-10-19T10:23:54Z","edit_date":"2012-12-29T17:19:54Z","is_active":true,"is_editable":true},{"id":3,"name":"Annotation 3","organization":{"id":3,"name":"Heartnotalogs","is_active":true},"status":{"id":3,"name":"IN_PROCESS","is_active":true},"signal_id":1,"creation_date":"2004-10-19T10:23:54Z","edit_date":"2012-12-29T17:19:54Z","is_active":true,"is_editable":true,"parent_id":2}]` {
		t.Error("Expected content", `[{"id":1,"name":"Annotation 1","organization":{"id":1,"name":"Cardiologs","is_active":true},"status":{"id":1,"name":"CREATED","is_active":true},"signal_id":1,"creation_date":"2004-10-19T10:23:54Z","edit_date":"2012-12-29T17:19:54Z","is_active":true,"is_editable":true},{"id":2,"name":"Annotation 2","organization":{"id":2,"name":"Podologs","is_active":true},"status":{"id":2,"name":"ASSIGNED","is_active":true},"signal_id":1,"creation_date":"2004-10-19T10:23:54Z","edit_date":"2012-12-29T17:19:54Z","is_active":true,"is_editable":true},{"id":3,"name":"Annotation 3","organization":{"id":3,"name":"Heartnotalogs","is_active":true},"status":{"id":3,"name":"IN_PROCESS","is_active":true},"signal_id":1,"creation_date":"2004-10-19T10:23:54Z","edit_date":"2012-12-29T17:19:54Z","is_active":true,"is_editable":true,"parent_id":2}]`)
	}
}

func TestCreateAnnotation(t *testing.T) {
	//utils.CreateTest("http://localhost:8000/annotations")
}
