package annotation

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"time"

	s "restapi/signal"
	u "restapi/utils"

	"github.com/gorilla/mux"
	"github.com/jinzhu/gorm"
	_ "github.com/lib/pq"
)

var templateURLAPI string

func init() {
	url := os.Getenv("API_URL")
	if url == "" {
		panic("API_URL environment variable not found, please set it like : \"http://hostname/route/\\%d\" where \\%d will be an integer")
	}
	templateURLAPI = url
}

func checkErrorCode(err error, w http.ResponseWriter) {
	switch err {
	case gorm.ErrRecordNotFound:
		http.Error(w, err.Error(), 204)
	case gorm.ErrInvalidSQL:
		http.Error(w, err.Error(), 400)
	case gorm.ErrInvalidTransaction:
	case gorm.ErrCantStartTransaction:
	case gorm.ErrUnaddressable:
		http.Error(w, err.Error(), 500)
	default:
		return
	}
}

// DeleteAnnotation remove an annotation
func DeleteAnnotation(w http.ResponseWriter, r *http.Request) {
	if r.Method != "DELETE" {
		http.Error(w, http.StatusText(405), 405)
		return
	}
	db := u.GetConnection()
	var annotation Annotation
	v := mux.Vars(r)
	if len(v) != 1 {
		log.Print("unvalidate arguments")
		return
	}
	checkErrorCode(db.First(&annotation, v["id"]).Error, w)
	annotation.IsActive = false
	checkErrorCode(db.Save(&annotation).Error, w)
}

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
	annotation.IsActive = true
	annotation.IsEditable = true

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

// FindAnnotationByID Find annotation by ID using GET Request
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

// ModifyAnnotation modifies an annotation
func ModifyAnnotation(w http.ResponseWriter, r *http.Request) {
	if r.Method != "PUT" {
		http.Error(w, http.StatusText(405), 405)
		return
	}

	db := u.GetConnection()

	var annotation Annotation

	json.NewDecoder(r.Body).Decode(&annotation)
	date := time.Now()
	annotation.EditDate = date
	annotation.IsActive = true

	err := db.Save(&annotation).Error
	if err != nil {
		http.Error(w, err.Error(), 400)
		return
	}
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
	response, err := formatToJSONFromAPI(fmt.Sprintf(templateURLAPI, 1))
	if err != nil {
		fmt.Println(" FAIL with \n", err)
	}

	fmt.Println(string(response))
}
