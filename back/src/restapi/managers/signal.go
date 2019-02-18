package managers

import (
	"errors"
	"fmt"
	"net/http"
	"os"

	u "restapi/utils"

	"github.com/gorilla/mux"
)

var templateURLAPI string

func init() {
	url := os.Getenv("API_URL")
	if url == "" {
		panic("API_URL environment variable not found, please set it like : \"http://hostname/route/\\%s\" where \\%s will be an integer")
	}
	templateURLAPI = url
}

// CheckSignal send HEAD request to check if signal exists or not
func CheckSignal(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("GET", u.CheckRoutes["signal"], w, r) {
		return
	}
	id := mux.Vars(r)["id"]
	err := SendCheckSignal(id)
	if err != nil {
		http.Error(w, err.Error(), 404)
		return
	}
	w.WriteHeader(200)
	w.Write([]byte("Exists"))
}

// SendCheckSignal send HEAD request and return nil if signal exists, return error if an error occured
func SendCheckSignal(id string) error {
	res, err := http.Head(fmt.Sprintf(templateURLAPI, id))
	if err != nil {
		return err
	}
	if res.StatusCode != 200 {
		return errors.New(res.Status)
	}
	return nil
}
