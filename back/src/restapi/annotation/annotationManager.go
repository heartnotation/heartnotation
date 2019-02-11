package annotation

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	s "restapi/signal"
	t "restapi/tag"
	u "restapi/utils"

	"github.com/gorilla/mux"
	"github.com/jinzhu/gorm"
)

var templateURLAPI string

func init() {
	url := os.Getenv("API_URL")
	if url == "" {
		panic("API_URL environment variable not found, please set it like : \"http://hostname/route/\\%s\" where \\%s will be an integer")
	}
	templateURLAPI = url
}

func checkErrorCode(err error, w http.ResponseWriter) bool {
	if err != nil {
		switch err {
		case gorm.ErrRecordNotFound:
			http.Error(w, err.Error(), 204)
		case gorm.ErrInvalidSQL:
			http.Error(w, err.Error(), 400)
		case gorm.ErrInvalidTransaction:
		case gorm.ErrCantStartTransaction:
		case gorm.ErrUnaddressable:
		default:
			http.Error(w, err.Error(), 500)
			return true
		}
	}
	return false
}

// DeleteAnnotation remove an annotation
func DeleteAnnotation(w http.ResponseWriter, r *http.Request) {
	db := u.GetConnection()
	var annotation Annotation
	v := mux.Vars(r)
	if len(v) != 1 {
		log.Print("unvalidate arguments")
		return
	}
	if checkErrorCode(db.First(&annotation, v["id"]).Error, w) {
		return
	}
	annotation.IsActive = false
	if checkErrorCode(db.Save(&annotation).Error, w) {
		return
	}
}

// CreateAnnotation function which receive a POST request and return a fresh-new annotation
func CreateAnnotation(w http.ResponseWriter, r *http.Request) {
	db := u.GetConnection()
	var a dto
	json.NewDecoder(r.Body).Decode(&a)

	tags := []t.Tag{}

	err := db.Where(a.TagsID).Find(&tags).Error
	if err != nil {
		checkErrorCode(err, w)
		return
	}

	if len(tags) != len(a.TagsID) {
		http.Error(w, "Tag not found", 204)
		return
	}
	if a.SignalID == 0 || a.Name == "" {
		http.Error(w, "Missing field", 424)
		return
	}
	if a.ParentID != 0 {
		parent := &Annotation{ID: a.ParentID}
		err = db.Find(&parent).Error
		if err != nil {
			checkErrorCode(err, w)
			return
		}
	}
	var status int
	if a.OrganizationID != 0 {
		status = 2
	} else {
		status = 1
	}
	date := time.Now()
	annotation := &Annotation{Name: a.Name, OrganizationID: &a.OrganizationID, ParentID: &a.ParentID, SignalID: a.SignalID, StatusID: &status, Tags: tags, CreationDate: date, EditDate: date, IsActive: true, IsEditable: true}
	if a.OrganizationID == 0 {
		annotation.OrganizationID = nil
	}
	if a.ParentID == 0 {
		annotation.ParentID = nil
	}
	err = db.Create(&annotation).Error
	if err != nil {
		checkErrorCode(err, w)
		return
	}
	err = db.Preload("Organization").Preload("Status").Preload("Tags").Preload("Parent").First(&annotation, annotation.ID).Error
	if err != nil {
		checkErrorCode(err, w)
		return
	}
	annotation.ParentID = nil
	annotation.OrganizationID = nil
	annotation.StatusID = nil

	u.RespondCreate(w, annotation)
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

	signal, e := formatToJSONFromAPI(fmt.Sprintf(templateURLAPI, strconv.Itoa(annotation.SignalID)))
	if e != nil {
		http.Error(w, e.Error(), 500)
	}
	annotation.Signal = signal
	annotation.OrganizationID = nil
	annotation.StatusID = nil

	u.Respond(w, annotation)
}

// ModifyAnnotation modifies an annotation
func ModifyAnnotation(w http.ResponseWriter, r *http.Request) {
	db := u.GetConnection()
	var annotation Annotation
	json.NewDecoder(r.Body).Decode(&annotation)
	annotation.EditDate = time.Now()
	if checkErrorCode(db.Save(&annotation).Error, w) {
		return
	}
	u.Respond(w, annotation)
}

func formatToJSONFromAPI(api string) ([][]*s.Point, error) {
	httpResponse, err := http.Get(api)
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

	return signalFormated, nil
}
