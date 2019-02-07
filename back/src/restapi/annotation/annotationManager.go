package annotation

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"time"

	s "restapi/signal"

	// import pq driver
	_ "github.com/lib/pq"

	u "restapi/utils"
)

// CreateAnnotation function which receive a POST request and return a fresh-new annotation
func CreateAnnotation(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, http.StatusText(405), 405)
		return
	}

	db := u.GetConnection()

	var annotation Annotation

	json.NewDecoder(r.Body).Decode(&annotation)

	date := time.Now()
	annotation.CreationDate = date
	annotation.EditDate = date

	if annotation.Organization.ID != 0 {
		annotation.ProcessID = 2
	} else {
		annotation.ProcessID = 1
	}

	err := db.Preload("Organization").Create(&annotation).Error
	if err != nil {
		http.Error(w, err.Error(), 403)
		return
	}
	u.Respond(w, annotation)

}

// FindAnnotations receive request to get all annotations in database
func FindAnnotations(w http.ResponseWriter, r *http.Request) {
	annotations := &[]Annotation{}
	err := u.GetConnection().Preload("Organization").Find(&annotations).Error
	if err != nil {
		http.Error(w, err.Error(), 404)
		return
	}
	u.Respond(w, annotations)
}



// Find annotation by ID using GET Request
func FindAnnotationByID(w http.ResponseWriter, r *http.Request) {
	annotations := &[]Annotation{}
	annID := r.FormValue("id")
	err := u.GetConnection().Preload("Organization").First(&annotations, annID).Error
	if err != nil {
		http.Error(w, err.Error(), 404)
		return
	}
	u.Respond(w, annotations)
}

func formatToJSONFromAPI(api string) ([]byte, error) {
	httpResponse, err := http.Get(api) //A parametrer
	if err != nil {
		return nil, err
	}

	dataBrut, err := ioutil.ReadAll(httpResponse.Body)
	if err != nil {
		return nil, err
	}

	signalFormated, err := s.FormatData(dataBrut, 3)
	if err != nil {
		return nil, err
	}

	var gui Gui
	gui.Signal = signalFormated

	jsonDatas, err := json.Marshal(gui)
	if err != nil {
		return nil, err
	}
	return jsonDatas, nil
}

//En attente de brancher avec le web (route de recuperation d'une annotation)
func incompleteTestForSignal() {
	response, err := formatToJSONFromAPI("https://cardiologsdb.blob.core.windows.net/cardiologs-public/ai/1.bin") //A parametrer
	if err != nil {
		fmt.Println(" FAIL with \n", err)
	}

	fmt.Println(string(response))
}
