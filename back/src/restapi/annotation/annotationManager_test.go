package annotation

import (
	"io/ioutil"
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

	if strings.TrimSpace(res.Body.String()) != `[{"id":1,"name":"Annotation 1","organization":{"id":1,"name":"Cardiologs","is_active":true},"status":{"id":1,"name":"CREATED","is_active":true},"signal_id":1,"creation_date":"2004-10-19T10:23:54Z","edit_date":"2012-12-29T17:19:54Z","is_active":true,"is_editable":true},{"id":2,"name":"Annotation 2","organization":{"id":2,"name":"Podologs","is_active":true},"status":{"id":2,"name":"ASSIGNED","is_active":true},"signal_id":1,"creation_date":"2004-10-19T10:23:54Z","edit_date":"2012-12-29T17:19:54Z","is_active":true,"is_editable":true},{"id":3,"name":"Annotation 3","organization":{"id":3,"name":"Heartnotalogs","is_active":true},"status":{"id":3,"name":"IN_PROCESS","is_active":true},"signal_id":1,"creation_date":"2004-10-19T10:23:54Z","edit_date":"2012-12-29T17:19:54Z","is_active":true,"is_editable":true,"parent_id":2}]` {
		t.Error("Expected content", `[{"id":1,"name":"Annotation 1","organization":{"id":1,"name":"Cardiologs","is_active":true},"status":{"id":1,"name":"CREATED","is_active":true},"signal_id":1,"creation_date":"2004-10-19T10:23:54Z","edit_date":"2012-12-29T17:19:54Z","is_active":true,"is_editable":true},{"id":2,"name":"Annotation 2","organization":{"id":2,"name":"Podologs","is_active":true},"status":{"id":2,"name":"ASSIGNED","is_active":true},"signal_id":1,"creation_date":"2004-10-19T10:23:54Z","edit_date":"2012-12-29T17:19:54Z","is_active":true,"is_editable":true},{"id":3,"name":"Annotation 3","organization":{"id":3,"name":"Heartnotalogs","is_active":true},"status":{"id":3,"name":"IN_PROCESS","is_active":true},"signal_id":1,"creation_date":"2004-10-19T10:23:54Z","edit_date":"2012-12-29T17:19:54Z","is_active":true,"is_editable":true,"parent_id":2}]`, "but received", res.Body.String())
	}
}

/*
func TestFindAnnotationsContentIDExists(t *testing.T) {
	req, _ := http.NewRequest("GET", "/annotations/1", nil)
	res := httptest.NewRecorder()

	FindAnnotationByID(res, req)

	if strings.TrimSpace(res.Body.String()) != `{"id":1,"name":"Annotation 1","organization":{"id":1,"name":"Cardiologs","is_active":true},"status":{"id":1,"name":"CREATED","is_active":true},"signal_id":1,"creation_date":"2004-10-19T10:23:54Z","edit_date":"2012-12-29T17:19:54Z","is_active":true,"is_editable":true}` {
		t.Error("Expected content", `{"id":1,"name":"Annotation 1","organization":{"id":1,"name":"Cardiologs","is_active":true},"status":{"id":1,"name":"CREATED","is_active":true},"signal_id":1,"creation_date":"2004-10-19T10:23:54Z","edit_date":"2012-12-29T17:19:54Z","is_active":true,"is_editable":true}`, "but received", res.Body.String())
	}
	res.Body.Reset()
}*/

func TestFindAnnotationsContentIDExists2(t *testing.T) {

	req, _ := http.NewRequest("GET", "/annotations/2", nil)
	res := httptest.NewRecorder()

	FindAnnotationByID(res, req)

	t.Log(res.Body.String())
}

func TestFindAnnotationsContentIDNotExists(t *testing.T) {
	//req, _ := http.NewRequest("GET", "/annotations/0", nil)
	resp, _ := http.Get("http://localhost:8000/annotations/0")
	//res := httptest.NewRecorder()

	defer resp.Body.Close()
	contents, err := ioutil.ReadAll(resp.Body)
	if err == nil {
		t.Log(string(contents))
	}
	//FindAnnotationByID(res, req)

	//t.Log(res.Body.String())
	/*
		if strings.TrimSpace(res.Body.String()) != ` ` {
			t.Error("Expected content", ` `, "but received", res.Body.String())
		}*/
}
