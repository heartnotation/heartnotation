package annotation

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	s "restapi/signal"
	"time"

	"github.com/gorilla/mux"

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

	if *(annotation.OrganizationID) != 0 {
		*annotation.StatusID = 2
	} else {
		*annotation.StatusID = 1
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
	err := u.GetConnection().Preload("Status").Preload("Organization").Find(&annotations).Error
	if err != nil {
		http.Error(w, err.Error(), 404)
		return
	}

	for i := range *annotations {
		arr := *annotations
		arr[i].OrganizationID = nil
		arr[i].StatusID = nil
	}

	u.Respond(w, annotations)
}

// Find annotation by ID using GET Request
func FindAnnotationByID(w http.ResponseWriter, r *http.Request) {
	annotation := Annotation{}
	vars := mux.Vars(r)
	err := u.GetConnection().Preload("Status").Preload("Organization").Where("is_active = ?", true).First(&annotation, vars["id"]).Error
	if err != nil {
		http.Error(w, err.Error(), 404)
		return
	}

	annotation.OrganizationID = nil
	annotation.StatusID = nil

	u.Respond(w, annotation)
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
