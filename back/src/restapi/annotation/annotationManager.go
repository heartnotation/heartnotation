package annotation

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"strconv"
	"time"

	s "restapi/signal"
	t "restapi/tag"
	user "restapi/user"
	u "restapi/utils"

	c "github.com/gorilla/context"
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

// DeleteAnnotation remove an annotation
func DeleteAnnotation(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("DELETE", u.CheckRoutes["annotations"], w, r) {
		return
	}
	v := mux.Vars(r)

	contextUser := c.Get(r, "user").(*user.User)

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
	var annotation Annotation
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
	db := u.GetConnection()
	var a dto
	json.NewDecoder(r.Body).Decode(&a)

	contextUser := c.Get(r, "user").(*user.User)

	switch contextUser.Role.ID {
	// Role Annotateur
	case 1:
		http.Error(w, "This action is not permitted on the actual user", 403)
		return
	// Role Gestionnaire & Admin
	default:
		break
	}

	tags := []t.Tag{}

	err := db.Where(a.TagsID).Find(&tags).Error
	if err != nil {
		u.CheckErrorCode(err, w)
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
			u.CheckErrorCode(err, w)
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
		u.CheckErrorCode(err, w)
		return
	}
	err = db.Set("gorm:auto_preload", true).First(&annotation, annotation.ID).Error
	if err != nil {
		u.CheckErrorCode(err, w)
		return
	}
	annotation.ParentID = nil
	annotation.OrganizationID = nil
	annotation.StatusID = nil

	u.RespondCreate(w, annotation)
}

// FindAnnotations receive request to get all annotations in database
func FindAnnotations(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("GET", u.CheckRoutes["annotations"], w, r) {
		return
	}
	var err error
	var currentUserOganizations []uint
	contextUser := c.Get(r, "user").(*user.User)
	for i := range contextUser.Organizations {
		currentUserOganizations = append(currentUserOganizations, contextUser.Organizations[i].ID)
	}
	annotations := &[]Annotation{}

	db := u.GetConnection().Set("gorm:auto_preload", true)
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
	for i := range *annotations {
		arr := *annotations
		arr[i].OrganizationID = nil
		arr[i].StatusID = nil
		arr[i].ParentID = nil
	}

	u.Respond(w, annotations)
}

// FindAnnotationByID Find annotation by ID using GET Request
func FindAnnotationByID(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("GET", u.CheckRoutes["annotations"], w, r) {
		return
	}
	annotation := Annotation{}
	vars := mux.Vars(r)

	var err error
	var currentUserOganizations []uint
	contextUser := c.Get(r, "user").(*user.User)
	for i := range contextUser.Organizations {
		currentUserOganizations = append(currentUserOganizations, contextUser.Organizations[i].ID)
	}
	db := u.GetConnection().Set("gorm:auto_preload", true)
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

func formatToJSONFromAPI(api string) ([][]*s.Point, error) {
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
	signalFormated, err := s.FormatData(dataBrut, int(leads))
	if err != nil {
		return nil, err
	}

	return signalFormated, nil
}
