package managers

import (
	"encoding/json"
	"net/http"
	d "restapi/dtos"
	m "restapi/models"
	u "restapi/utils"
	"time"

	c "github.com/gorilla/context"
	"github.com/gorilla/mux"
)

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

	db := u.GetConnection().Preload("Organization").Preload("Status").Preload("Status.EnumStatus").Preload("Status.User").Preload("Tags")
	switch contextUser.Role.ID {
	// Role Annotateur
	case 1:
		// Request only annotation concerned by currentUser organizations and wher status != CREATED
		err = db.Where("organization_id in (?) AND is_active = ?", currentUserOganizations, true).Find(&annotations).Error
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
	//Display last status
	for i := range annotations {
		annotations[i].LastStatus, annotations[i].FirstStatus = annotations[i].GetLastAndFirstStatus()
		annotations[i].OrganizationID = nil
		annotations[i].Status = nil
		annotations[i].ParentID = nil
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

	if len(v) != 1 || len(v["id"]) == 0 || !u.IsStringInt(v["id"]) {
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
	if a.SignalID == "" || a.Name == nil || a.TagsID == nil {
		http.Error(w, "invalid args", 400)
		return
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
	db := u.GetConnection()
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
	var statusID int
	if a.OrganizationID != nil && *a.OrganizationID != 0 {
		statusID = 2
	} else {
		statusID = 1
	}

	transaction := db.Begin()

	date := time.Now()
	annotation := m.Annotation{Name: *a.Name, OrganizationID: a.OrganizationID, ParentID: a.ParentID, SignalID: a.SignalID, Tags: tags, CreationDate: date, EditDate: date, IsActive: true, IsEditable: true}
	if u.CheckErrorCode(transaction.Create(&annotation).Error, w) {
		transaction.Rollback()
		return
	}

	status := m.Status{EnumstatusID: &statusID, UserID: &contextUser.ID, AnnotationID: &annotation.ID, Date: time.Now()}
	if u.CheckErrorCode(transaction.Create(&status).Error, w) {
		transaction.Rollback()
		return
	}

	if u.CheckErrorCode(transaction.Model(&annotation).Association("Status").Append(&status).Error, w) {
		transaction.Rollback()
		return
	}

	transaction.Commit()
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
		err = db.Where("organization_id in (?) AND is_active = ?", currentUserOganizations, true).First(&annotation, vars["id"]).Error
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

	signal, e := FormatToJSONFromAPI(annotation.SignalID)
	if e != nil {
		http.Error(w, e.Error(), 500)
		return
	}
	annotation.LastStatus, annotation.FirstStatus = annotation.GetLastAndFirstStatus()
	annotation.Signal = signal
	u.Respond(w, annotation)
}

// UpdateAnnotationStatus change the status of an annotation
func UpdateAnnotationStatus(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("PUT", u.CheckRoutes["annotations"], w, r) {
		return
	}

	contextUser := c.Get(r, "user").(*m.User)

	annotationStatus := d.AnnotationStatus{}
	json.NewDecoder(r.Body).Decode(&annotationStatus)

	if annotationStatus.ID == 0 || annotationStatus.EnumStatus == 0 {
		http.Error(w, "One or more field is missing", http.StatusNotAcceptable)
		return
	}

	db := u.GetConnection()

	enumStatus := m.EnumStatus{}
	if u.CheckErrorCode(db.Where(annotationStatus.EnumStatus).First(&enumStatus).Error, w) {
		return
	}

	transaction := db.Begin()

	status := m.Status{EnumStatus: &enumStatus, UserID: &contextUser.ID, AnnotationID: &annotationStatus.ID, Date: time.Now()}
	if u.CheckErrorCode(transaction.Create(&status).Error, w) {
		transaction.Rollback()
		return
	}

	annotation := m.Annotation{ID: annotationStatus.ID}
	if u.CheckErrorCode(transaction.Model(&annotation).Association("Status").Append(&status).Error, w) {
		transaction.Rollback()
		return
	}

	transaction.Commit()
	if u.CheckErrorCode(db.Preload("Organization").Preload("Status").Preload("Status.EnumStatus").Preload("Status.User").Preload("Tags").Preload("Commentannotation").Preload("Commentannotation.User").Find(&annotation).Error, w) {
		return
	}
	u.Respond(w, &annotation)

}

// UpdateAnnotation modifies an annotation
func UpdateAnnotation(w http.ResponseWriter, r *http.Request) {
	if u.CheckMethodPath("PUT", u.CheckRoutes["annotations"], w, r) {
		return
	}

	contextUser := c.Get(r, "user").(*m.User)

	switch contextUser.Role.ID {
	// Role Annotateur
	case 1:
		http.Error(w, "This action is not permitted on the actual user", 403)
		break
	// Role Gestionnaire & Admin
	default:
		break
	}

	a := d.Annotation{}
	err := json.NewDecoder(r.Body).Decode(&a)
	if err != nil {
		http.Error(w, "Fail to parse request body", 400)
	}
	db := u.GetConnection()

	annotation := m.Annotation{}
	db.Preload("Status").Preload("Status.EnumStatus").Preload("Organization").Preload("Tags").Where(*a.ID).Find(&annotation)

	annotation.LastStatus, annotation.FirstStatus = annotation.GetLastAndFirstStatus()
	if annotation.LastStatus != nil && annotation.LastStatus.EnumStatus.ID > 2 {
		if annotation.Organization != nil && annotation.Organization.ID != *a.OrganizationID {
			http.Error(w, "Cannot change organization for started annotations", 400)
			return
		}
		if !m.CompareTags(a, annotation) {
			http.Error(w, "Cannot change authorized tags for started annotations", 400)
			return
		}
	}

	if len(a.TagsID) <= 0 {
		http.Error(w, "You must provide some authorized tags", 400)
		return
	}

	m := m.ToMap(annotation, a)

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
