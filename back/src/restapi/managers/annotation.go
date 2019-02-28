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
	"github.com/jinzhu/gorm"
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
		// Request only annotation concerned by currentUser organizations and where status != CREATED
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
	if a.SignalID == "" || a.Name == "" || a.TagsID == nil {
		http.Error(w, "invalid args", 400)
		return
	}
	contextUser := c.Get(r, "user").(*m.User)

	switch contextUser.Role.ID {
	// Role Gestionnaire
	case 2:
		break
	// Role Annotateur & Admin
	default:
		http.Error(w, "This action is not permitted on the actual user", 403)
		return
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
	if a.SignalID == "" || a.Name == "" {
		http.Error(w, "Missing field", 424)
		return
	}
	annotationCommentsChild := []m.AnnotationComment{}
	annotationIntervalChild := []m.Interval{}
	annotationIntervalParent := []m.Interval{}
	if a.ParentID != nil {
		parent := &m.Annotation{}
		err = db.Preload("Status").Preload("Status.EnumStatus").Find(&parent, *a.ParentID).Error
		if err != nil {
			u.CheckErrorCode(err, w)
			return
		}

		if parent.SignalID != a.SignalID {
			http.Error(w, "Incorrect field: SignalID must be the same as the parent", 400)
			return
		}
		var lastStatus m.Status
		if parent.Status != nil && len(parent.Status) != 0 {
			lastStatus = parent.Status[0]
			for _, status := range parent.Status {
				if lastStatus.Date.Unix() < status.Date.Unix() {
					lastStatus = status
				}
			}
		}

		if *lastStatus.EnumstatusID < 5 {
			http.Error(w, "Incorrect field: Parent must be in finished state", 400)
			return
		}

		//All tests have passed, parendID is correct can copy the datas

		//annotation comments
		annotationCommentsParent := []m.AnnotationComment{}
		err = db.Preload("User").Where("annotation_id = ?", a.ParentID).Find(&annotationCommentsParent).Error
		if err != nil {
			u.CheckErrorCode(err, w)
			return
		}
		for i := 0; i < len(annotationCommentsParent); i++ {
			annotationCommentCpy := m.AnnotationComment{}
			annotationCommentCpy.Comment = annotationCommentsParent[i].Comment
			annotationCommentCpy.Date = annotationCommentsParent[i].Date
			annotationCommentCpy.UserID = annotationCommentsParent[i].UserID

			annotationCommentsChild = append(annotationCommentsChild, annotationCommentCpy)
		}

		//annotation interval
		err = db.Preload("Tags").Where("annotation_id = ?", a.ParentID).Find(&annotationIntervalParent).Error
		if err != nil {
			u.CheckErrorCode(err, w)
			return
		}
		for i := 0; i < len(annotationIntervalParent); i++ {
			annotationIntervalCpy := m.Interval{}
			annotationIntervalCpy.Tags = annotationIntervalParent[i].Tags
			annotationIntervalCpy.TimeEnd = annotationIntervalParent[i].TimeEnd
			annotationIntervalCpy.TimeStart = annotationIntervalParent[i].TimeStart
			annotationIntervalCpy.IsActive = true

			annotationIntervalChild = append(annotationIntervalChild, annotationIntervalCpy)
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
	annotation := m.Annotation{Name: a.Name, OrganizationID: a.OrganizationID, Commentannotation: annotationCommentsChild, ParentID: a.ParentID, SignalID: a.SignalID, Tags: tags, CreationDate: date, EditDate: date, IsActive: true, IsEditable: true}

	if u.CheckErrorCode(transaction.Create(&annotation).Error, w) {
		transaction.Rollback()
		return
	}
	for i := 0; i < len(annotationIntervalChild); i++ {
		annotationIntervalChild[i].AnnotationID = annotation.ID
		if u.CheckErrorCode(transaction.Create(&annotationIntervalChild[i]).Error, w) {
			transaction.Rollback()
			return
		}

		annotationIntervalComments := []m.IntervalComment{}
		err = db.Where("interval_id = ?", annotationIntervalParent[i].ID).Find(&annotationIntervalComments).Error
		if err != nil {
			u.CheckErrorCode(err, w)
			return
		}
		for j := 0; j < len(annotationIntervalComments); j++ {
			annotationIntervalCommentCpy := m.IntervalComment{}
			annotationIntervalCommentCpy.Comment = annotationIntervalComments[j].Comment
			annotationIntervalCommentCpy.Date = annotationIntervalComments[j].Date
			annotationIntervalCommentCpy.UserID = annotationIntervalComments[j].UserID
			annotationIntervalCommentCpy.IntervalID = annotationIntervalChild[i].ID
			if u.CheckErrorCode(transaction.Create(&annotationIntervalCommentCpy).Error, w) {
				transaction.Rollback()
				return
			}
		}
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
		// Request only annotation concerned by currentUser organizations and where status != CREATED
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

	if contextUser.RoleID == 3 {
		http.Error(w, "The current user can not modify this annotation at this time", http.StatusForbidden)
		return
	}

	annotationStatus := d.AnnotationStatus{}
	json.NewDecoder(r.Body).Decode(&annotationStatus)

	if annotationStatus.ID == 0 || annotationStatus.EnumStatus == 0 {
		http.Error(w, "One or more field is missing", http.StatusNotAcceptable)
		return
	}

	db := u.GetConnection()
	a := m.Annotation{}
	db.Preload("Status").Preload("Status.EnumStatus").Where(annotationStatus.ID).Find(&a)

	a.LastStatus, _ = a.GetLastAndFirstStatus()

	if contextUser.RoleID == 1 {
		if *a.LastStatus.EnumstatusID == 1 || *a.LastStatus.EnumstatusID == 4 || *a.LastStatus.EnumstatusID == 5 || *a.LastStatus.EnumstatusID == 6 {
			http.Error(w, "The current user can not modify this annotation at this time", http.StatusForbidden)
			return
		}
	} else {
		if (*a.LastStatus.EnumstatusID == 2 && !(annotationStatus.EnumStatus == 1 || annotationStatus.EnumStatus == 6)) || *a.LastStatus.EnumstatusID == 3 || *a.LastStatus.EnumstatusID == 5 || *a.LastStatus.EnumstatusID == 6 {
			http.Error(w, "The current user can not modify this annotation at this time", http.StatusForbidden)
			return
		}
	}

	changeStatusEditDate(db, w, annotationStatus.EnumStatus, &contextUser.ID, annotationStatus.ID)
}

func changeStatusEditDate(db *gorm.DB, w http.ResponseWriter, enumStatusID int, userID *int, annotationID int) {
	enumStatus := m.EnumStatus{}
	if u.CheckErrorCode(db.Where(enumStatusID).First(&enumStatus).Error, w) {
		return
	}

	transaction := db.Begin()

	date := time.Now()
	status := m.Status{EnumStatus: &enumStatus, UserID: userID, AnnotationID: &annotationID, Date: date}
	if u.CheckErrorCode(transaction.Create(&status).Error, w) {
		transaction.Rollback()
		return
	}

	annotation := m.Annotation{ID: annotationID}
	if u.CheckErrorCode(transaction.Model(&annotation).Association("Status").Append(&status).Error, w) {
		transaction.Rollback()
		return
	}

	annotationEditDate := m.Annotation{}
	if u.CheckErrorCode(db.First(&annotationEditDate, annotationID).Error, w) {
		transaction.Rollback()
		return
	}
	annotationEditDate.EditDate = date
	if u.CheckErrorCode(db.Save(&annotationEditDate).Error, w) {
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

	if annotation.Organization == nil && a.OrganizationID != annotation.OrganizationID {
		changeStatusEditDate(db, w, 2, &contextUser.ID, *a.ID)
	} else if annotation.Organization != nil && a.OrganizationID == nil {
		changeStatusEditDate(db, w, 1, &contextUser.ID, *a.ID)
	}

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
