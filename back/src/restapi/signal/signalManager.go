package signal

import (
	"fmt"
	"net/http"
	"os"

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
	id := mux.Vars(r)["id"]
	res, err := http.Head(fmt.Sprintf("https://cardiologsdb.blob.core.windows.net/cardiologs-public/ai/%s.bin", id))
	if err != nil {
		http.Error(w, err.Error(), 400)
		return
	}
	if res.StatusCode != 200 {
		http.Error(w, res.Status, res.StatusCode)
		return
	}
	w.WriteHeader(200)
	w.Write([]byte("Exists"))
}
