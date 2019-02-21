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

	c "github.com/gorilla/context"
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
	var err error
	var currentUserOganizations []int
	contextUser := c.Get(r, "user").(*m.User)
	for i := range contextUser.Organizations {
		currentUserOganizations = append(currentUserOganizations, contextUser.Organizations[i].ID)
	}
	annotations := []m.Annotation{}

	db := u.GetConnection().Preload("Organization").Preload("Status").Preload("Status.EnumStatus")
	switch contextUser.Role.ID {
	// Role Annotateur
	case 1:
		// Request only annotation concerned by currentUser organizations and wher status != CREATED
		err = db.Where("organization_id in (?) AND status_id != ? AND is_active = ?", currentUserOganizations, 1, true).Find(&annotations).Error
		break
	// Role Gestionnaire & Admin
	default:
		err = db.Find(&annotations).Error
		break
	}

	if err != nil {
		http.Error(w, err.Error(), 404)
		return
	}
	for i := range annotations {
		arr := annotations
		arr[i].OrganizationID = nil
		arr[i].Status = nil
		arr[i].ParentID = nil
	}

	u.Respond(w, annotations)
}

// DeleteAnnotation remove an annotation
func DeleteAnnotation(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("DELETE", u.CheckRoutes["annotations"], w, r) {
		return
	}
	v := mux.Vars(r)

	contextUser := c.Get(r, "user").(*m.User)

	switch contextUser.Role.ID {
	// Role Annotateur
	case 1:
		http.Error(w, "This action is not permitted on the actual user", 403)
		return
	// Role Gestionnaire & Admin
	default:
		break
	}

	if len(v) != 1 || len(v["id"]) != 0 || !u.IsStringInt(v["id"]) {
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
	if a.SignalID == "" || a.Name == nil || a.OrganizationID == nil || a.TagsID == nil {
		http.Error(w, "invalid args", 204)
	}
	contextUser := c.Get(r, "user").(*m.User)

	switch contextUser.Role.ID {
	// Role Annotateur
	case 1:
		http.Error(w, "This action is not permitted on the actual user", 403)
		return
	// Role Gestionnaire & Admin
	default:
		break
	}

	tags := []m.Tag{}
	db := u.GetConnection().Set("gorm:auto_preload", true)
	err := db.Where(a.TagsID).Find(&tags).Error
	if err != nil {
		u.CheckErrorCode(err, w)
		return
	}

	if u.CheckErrorCode(db.Find(&tags, a.TagsID).Error, w) {
		return
	}
	if a.SignalID == "" || *a.Name == "" {
		http.Error(w, "Missing field", 424)
		return
	}
	if a.ParentID != nil {
		parent := &m.Annotation{ID: *a.ParentID}
		err = db.Find(&parent).Error
		if err != nil {
			u.CheckErrorCode(err, w)
			return
		}
	}
	/*
		var status int
		if *a.OrganizationID != 0 {
			status = 2
		} else {
			status = 1
		}*/
	date := time.Now()
	annotation := m.Annotation{Name: *a.Name, OrganizationID: a.OrganizationID, ParentID: a.ParentID, SignalID: a.SignalID, Tags: tags, CreationDate: date, EditDate: date, IsActive: true, IsEditable: true}
	if u.CheckErrorCode(db.Create(&annotation).Error, w) {
		return
	}

	u.RespondCreate(w, annotation)
}

// FindAnnotationByID Find annotation by ID using GET Request
func FindAnnotationByID(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("GET", u.CheckRoutes["annotation"], w, r) {
		return
	}
	annotation := m.Annotation{}
	vars := mux.Vars(r)

	var err error
	var currentUserOganizations []int
	contextUser := c.Get(r, "user").(*m.User)
	for i := range contextUser.Organizations {
		currentUserOganizations = append(currentUserOganizations, contextUser.Organizations[i].ID)
	}
	db := u.GetConnection().Preload("Organization").Preload("Status").Preload("Status.EnumStatus").Preload("Status.User").Preload("Tags").Preload("Commentannotation").Preload("Commentannotation.User")
	switch contextUser.Role.ID {
	// Role Annotateur
	case 1:
		// Request only annotation concerned by currentUser organizations and wher status != CREATED
		err = db.Where("organization_id in (?) AND status_id != ? AND is_active = ?", currentUserOganizations, 1, true).First(&annotation, vars["id"]).Error
		break
	// Role Gestionnaire & Admin
	default:
		err = db.First(&annotation, vars["id"]).Error
		break
	}

	if err != nil {
		http.Error(w, err.Error(), 404)
		return
	}

	signal, e := formatToJSONFromAPI(annotation.SignalID)
	if e != nil {
		http.Error(w, e.Error(), 500)
		return
	}
	annotation.Signal = signal
	u.Respond(w, annotation)
}

/*
// UpdateAnnotation modifies an annotation
func UpdateAnnotation(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("PUT", u.CheckRoutes["annotations"], w, r) {
		return
	}
	db := u.GetConnection().Set("gorm:auto_preload", true)
	var annotation d.Annotation
	json.NewDecoder(r.Body).Decode(&annotation)
	annotation.EditDate = time.Now()
	//db.Model(&annotation).Association("OK").Replace()
// ModifyAnnotation modifies an annotation
func ModifyAnnotation(w http.ResponseWriter, r *http.Request) {
	a := dto{}
	err := json.NewDecoder(r.Body).Decode(&a)
	if err != nil {
		http.Error(w, "Fail to parse request body", 400)
	}
	db := u.GetConnection().Set("gorm:auto_preload", true)

	annotation := Annotation{}
	db.Where(a.ID).Find(&annotation)

	if annotation.Status.ID > 2 {
		if annotation.Organization != nil && annotation.Organization.ID != uint(a.OrganizationID) {
			http.Error(w, "Cannot change organization for started annotations", 400)
			return
		}
		if !compareTags(a, annotation) {
			http.Error(w, "Cannot change authorized tags for started annotations", 400)
			return
		}
	}

	if len(a.TagsID) <= 0 {
		http.Error(w, "You must provide some authorized tags", 400)
		return
	}

	contextUser := c.Get(r, "user").(*user.User)

	switch contextUser.Role.ID {
	// Role Annotateur
	case 1:
		// Request only annotation concerned by currentUser organizations and wher status != CREATED
		http.Error(w, "This action is not permitted on the actual user", 403)
		break
	// Role Gestionnaire & Admin
	default:
		break
	}

	m := a.toMap(annotation)

	transaction := db.Begin()
	if u.CheckErrorCode(transaction.Model(&annotation).Updates(m).Error, w) {
		transaction.Rollback()
		return
	}

	if u.CheckErrorCode(transaction.Model(&annotation).Association("Tags").Replace(m["tags"]).Error, w) {
		transaction.Rollback()
		return
	}
	transaction.Commit()
	u.Respond(w, annotation)
}
*/

func formatToJSONFromAPI(signalID string) ([][]*m.Point, error) {
	httpResponse, err := http.Get(fmt.Sprintf(templateURLAPI, signalID))
	if err != nil {
		return nil, err
	}

	dataBrut, err := ioutil.ReadAll(httpResponse.Body)
	if err != nil {
		return nil, err
	}
	leadNumber := httpResponse.Header.Get("LEAD_NUMBER")
	var leads int64
	if signalID == "ecg" {
		leads = 2
	} else if leadNumber == "" {
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
