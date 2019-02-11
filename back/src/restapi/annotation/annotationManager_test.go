package annotation

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestFindAnnotationsCode200(t *testing.T) {
	req, _ := http.NewRequest("GET", "/annotations", nil)
	res := httptest.NewRecorder()

	FindAnnotations(res, req)

	if res.Code != 200 {
		t.Error("Expected code 200 but received", res.Code)
	}
}

func TestFindAnnotationsContent(t *testing.T) {
	req, _ := http.NewRequest("GET", "/annotations", nil)
	res := httptest.NewRecorder()

	FindAnnotations(res, req)

	if strings.TrimSpace(res.Body.String()) != `[{"id":1,"name":"Première annotation","organization":{"id":1,"name":"Cardiologs","is_active":true},"status":{"id":1,"name":"CREATED","is_active":true},"signal_id":1,"creation_date":"2004-10-19T10:23:54Z","edit_date":"2012-12-29T17:19:54Z","is_active":true},{"id":2,"name":"Seconde annotation","organization":{"id":2,"name":"Podologs","is_active":true},"status":{"id":2,"name":"ASSIGNED","is_active":true},"signal_id":1,"creation_date":"2004-10-19T10:23:54Z","edit_date":"2012-12-29T17:19:54Z","is_active":true},{"id":3,"name":"Troisième annotation qui se base sur la deuxième","organization":{"id":3,"name":"Heartnotalogs","is_active":true},"status":{"id":3,"name":"IN_PROCESS","is_active":true},"signal_id":1,"creation_date":"2004-10-19T10:23:54Z","edit_date":"2012-12-29T17:19:54Z","is_active":true,"parent_id":2}]` {
		t.Error("Expected content", `[{"id":1,"name":"Première annotation","organization":{"id":1,"name":"Cardiologs","is_active":true},"status":{"id":1,"name":"CREATED","is_active":true},"signal_id":1,"creation_date":"2004-10-19T10:23:54Z","edit_date":"2012-12-29T17:19:54Z","is_active":true},{"id":2,"name":"Seconde annotation","organization":{"id":2,"name":"Podologs","is_active":true},"status":{"id":2,"name":"ASSIGNED","is_active":true},"signal_id":1,"creation_date":"2004-10-19T10:23:54Z","edit_date":"2012-12-29T17:19:54Z","is_active":true},{"id":3,"name":"Troisième annotation qui se base sur la deuxième","organization":{"id":3,"name":"Heartnotalogs","is_active":true},"status":{"id":3,"name":"IN_PROCESS","is_active":true},"signal_id":1,"creation_date":"2004-10-19T10:23:54Z","edit_date":"2012-12-29T17:19:54Z","is_active":true,"parent_id":2}]`, "but received", res.Body.String())
	}
}
