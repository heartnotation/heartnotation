package managers

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	d "restapi/dtos"
	m "restapi/models"
	u "restapi/utils"
	"strconv"
	"time"

	"github.com/gorilla/mux"
)

var templateURLAPI string

func init() {
	//a := d.Annotation{}
	url := os.Getenv("API_URL")
	if url == "" {
		panic("API_URL environment variable not found, please set it like : \"http://hostname/route/\\%s\" where \\%s will be an integer")
	}
	templateURLAPI = url
}

// GetAllAnnotations list all annotations
func GetAllAnnotations(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("GET", u.CheckRoutes["annotations"], w, r) {
		return
	}
	annotations := []m.Annotation{}
	if u.CheckErrorCode(u.GetConnection().Set("gorm:auto_preload", true).Find(&annotations).Error, w) {
		return
	}
	u.Respond(w, annotations)
}

// DeleteAnnotation remove an annotation
func DeleteAnnotation(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("DELETE", u.CheckRoutes["annotations"], w, r) {
		return
	}
	v := mux.Vars(r)
	if len(v) != 1 || !u.IsStringInt(v["id"]) {
		http.Error(w, "Bad request", 400)
		return
	}
	var annotation m.Annotation
	db := u.GetConnection()
	if u.CheckErrorCode(db.First(&annotation, v["id"]).Error, w) {
		return
	}
	annotation.IsActive = false
	if u.CheckErrorCode(db.Save(&annotation).Error, w) {
		return
	}
}

// CreateAnnotation function which receive a POST request and return a fresh-new annotation
func CreateAnnotation(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("POST", u.CheckRoutes["annotations"], w, r) {
		return
	}
	var a d.Annotation
	json.NewDecoder(r.Body).Decode(&a)
	if a.SignalID == nil || a.Name == nil || a.OrganizationID == nil || a.TagsID == nil {
		http.Error(w, "invalid args", 204)
		return
	}
	db := u.GetConnection().Set("gorm:auto_preload", true)
	tags := []m.Tag{}
	if u.CheckErrorCode(db.Find(&tags, a.TagsID).Error, w) {
		return
	}
	date := time.Now()
	annotation := m.Annotation{Name: *a.Name, OrganizationID: *a.OrganizationID, ParentID: a.ParentID, SignalID: *a.SignalID, Tags: tags, CreationDate: date, EditDate: date, IsActive: true, IsEditable: true}
	if u.CheckErrorCode(db.Create(&annotation).Error, w) {
		return
	}
	if u.CheckErrorCode(db.First(&annotation, annotation.ID).Error, w) {
		return
	}
	u.RespondCreate(w, annotation)
}

// FindAnnotations receive request to get all annotations in database
func FindAnnotations(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("GET", u.CheckRoutes["annotations"], w, r) {
		return
	}
	annotations := []m.Annotation{}
	if u.CheckErrorCode(u.GetConnection().Set("gorm:auto_preload", true).Find(&annotations).Error, w) {
		return
	}
	u.Respond(w, annotations)
}

// FindAnnotationByID Find annotation by ID using GET Request
func FindAnnotationByID(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("GET", u.CheckRoutes["annotations"], w, r) {
		return
	}
	annotation := m.Annotation{}
	vars := mux.Vars(r)
	if u.CheckErrorCode(u.GetConnection().Set("gorm:auto_preload", true).Where("is_active = ?", true).First(&annotation, vars["id"]).Error, w) {
		return
	}
	signal, e := formatToJSONFromAPI(fmt.Sprintf(templateURLAPI, strconv.Itoa(annotation.SignalID)))
	if e != nil {
		http.Error(w, e.Error(), 500)
	}
	annotation.Signal = signal
	u.Respond(w, annotation)
}

/*
// ModifyAnnotation modifies an annotation
func ModifyAnnotation(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("PUT", u.CheckRoutes["annotations"], w, r) {
		return
	}
	db := u.GetConnection().Set("gorm:auto_preload", true)
	var annotation d.Annotation
	json.NewDecoder(r.Body).Decode(&annotation)
	annotation.EditDate = time.Now()

	if u.CheckErrorCode(db.Save(&annotation).Error, w) {
		return
	}
	if err := u.GetConnection().Preload("Status").Preload("Organization").Where("is_active = ?", true).First(&annotation, annotation.ID).Error; err != nil {
		u.CheckErrorCode(err, w)
		return
	}
	u.Respond(w, annotation)
}
*/

func formatToJSONFromAPI(api string) ([][]*m.Point, error) {
	httpResponse, err := http.Get(api)
	if err != nil {
		return nil, err
	}

	dataBrut, err := ioutil.ReadAll(httpResponse.Body)
	if err != nil {
		return nil, err
	}
	leadNumber := httpResponse.Header.Get("LEAD_NUMBER")
	var leads int64
	if leadNumber == "" {
		leads = 3
	} else {
		leads, _ = strconv.ParseInt(leadNumber, 10, 64)
	}
	signalFormated, err := m.FormatData(dataBrut, int(leads))
	if err != nil {
		return nil, err
	}

	return signalFormated, nil
}
