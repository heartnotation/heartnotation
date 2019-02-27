package dtos

// Annotation DTO of annotation
type Annotation struct {
	ID             *int   `json:"id"`
	Name           string `json:"name"`
	OrganizationID *int   `json:"organization_id"`
	SignalID       string `json:"signal_id"`
	StatusID       []int  `json:"status_id"`
	ParentID       *int   `json:"parent_id"`
	TagsID         []int  `json:"tags"`
}

/*
func (annotationDTO Annotation) toMap(annotation m.Annotation) map[string]interface{} {
	mapObject := make(map[string]interface{})
	mapObject["id"] = d.ID
	mapObject["name"] = d.Name

	organization := &m.Organization{}
	if err := utils.GetConnection().Where(annotationDTO.OrganizationID).Find(organization).Error; err != nil {
		organization = nil
	}

	mapObject["organization"] = organization
	mapObject["organization_id"] = nil

	var newStatus int

	if int(annotationDTO.StatusID) != annotation.Status.ID {
		newStatus = int(annotationDTO.StatusID)
	} else {
		if annotationDTO.OrganizationID == 0 {
			newStatus = 1
		} else if annotation.Status.ID < 3 && annotationDTO.OrganizationID != 0 {
			newStatus = 2
		} else {
			newStatus = annotation.Status.ID
		}
	}

	status := &m.Status{}
	utils.GetConnection().Where(newStatus).Find(status)
	m["status"] = status

	tags := []t.Tag{}
	utils.GetConnection().Where(d.TagsID).Find(&tags)
	m["tags"] = tags
	m["edit_date"] = time.Now()

	return m
}

func compareTags(annotationDTO dto, annotation Annotation) bool {
	if len(annotationDTO.TagsID) != len(annotation.Tags) {
		return false
	}

	for index, tag := range annotation.Tags {
		if tag.ID != int(annotationDTO.TagsID[index]) {
			return false
		}
	}
	return true
}
*/
