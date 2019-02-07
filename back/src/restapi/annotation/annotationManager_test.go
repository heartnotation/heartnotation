package annotation

import (
	"net/http"
)

func Sum(x int, y int) int {
	return x + y
}

// func init() {
// 	http.HandleFunc("/annotation", getAnnotation)
// 	http.ListenAndServe(":3000", nil)
// }

type API struct {
	Client  *http.Client
	baseURL string
}

// func (api *API) DoStuff() ([]byte, error) {
// 	resp, err := api.Client.Get("localhost:3000/annotation?id=2")
// 	if err != nil {
// 		return nil, err
// 	}
// 	defer resp.Body.Close()
// 	body, err := ioutil.ReadAll(resp.Body)
// 	// handling error and doing stuff with body that needs to be unit tested
// 	return body, err
// }

// func TestDoStuffWithTestServer(t *testing.T) {
// 	// Start a local HTTP server
// 	server := httptest.NewServer(http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
// 		// Test request parameters
// 		equals(t, req.URL.String(), "/some/path")
// 		// Send response to be tested
// 		rw.Write([]byte(`OK`))
// 	}))
// 	// Close the server when test finishes
// 	defer server.Close()

// 	// Use Client & URL from our local test server
// 	api := API{server.Client(), server.URL}
// 	body, err := api.DoStuff()

// 	// ok(t, err)
// 	// equals(t, []byte("OK"), body)
// }

// func TestGetAnnotation(t *testing.T) {
// 	handler := func(w http.ResponseWriter, r *http.Request) {
// 		// here we write our expected response, in this case, we return a
// 		// JSON string which is typical when dealing with REST APIs
// 		io.WriteString(w, "{ \"status\": \"expected service response\"}")
// 	}
// 	//fmt.Print("here")
// 	req := httptest.NewRequest("GET", "localhost:3000/annotation?id=5", nil)
// 	w := httptest.NewRecorder()
// 	handler(w, req)

// 	resp := w.Result()
// 	body, _ := ioutil.ReadAll(resp.Body)
// 	fmt.Println(resp.StatusCode)
// 	fmt.Println(resp.Header.Get("Content-Type"))
// 	fmt.Println(string(body))
// 	// total := Sum(5, 5)
// 	// if total != 10 {
// 	// 	t.Errorf("Sum was incorrect, got: %d, want: %d.", total, 10)
// 	// }
// }
