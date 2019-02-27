package models

import (
	"time"

	d "restapi/dtos"
	"restapi/utils"
)

// Annotation structure to represent an annotation
type Annotation struct {
	ID                int                 `json:"id"`
	Name              string              `json:"name"`
	CreationDate      time.Time           `json:"creation_date"`
	EditDate          time.Time           `json:"edit_date"`
	IsActive          bool                `json:"is_active"`
	IsEditable        bool                `json:"is_editable"`
	SignalID          string              `json:"signal_id"`
	Signal            [][]*Point          `json:"signal,omitempty" gorm:"-"`
	OrganizationID    *int                `json:"-"`
	Organization      *Organization       `json:"organization,omitempty" gorm:"foreignkey:OrganizationID"`
	Commentannotation []AnnotationComment `json:"comments,omitempty" gorm:"foreignkey:AnnotationID"`
	Status            []Status            `json:"status,omitempty" gorm:"foreignkey:AnnotationID"`
	FirstStatus       *Status             `json:"first_status,omitempty"`
	LastStatus        *Status             `json:"last_status,omitempty"`
	ParentID          *int                `json:"parent_id,omitempty" gorm:"foreignkey:Parent"`
	Parent            *Annotation         `json:"parent,omitempty"`
	Tags              []Tag               `json:"tags,omitempty" gorm:"many2many:annotation_tag"`
}

// TableName sets table name of the struct
func (Annotation) TableName() string {
	return "annotation"
}

// ToMap return a map containing all fields of an annotation to modify
func ToMap(annotation Annotation, d d.Annotation) map[string]interface{} {
	m := make(map[string]interface{})
	m["id"] = d.ID
	m["name"] = d.Name

	if d.OrganizationID != nil {
		orga := &Organization{}
		if err := utils.GetConnection().Where(*d.OrganizationID).Find(orga).Error; err != nil {
			orga = nil
		}

		m["organization"] = orga
		m["organization_id"] = nil
	} else {
		m["organization"] = nil
		m["organization_id"] = nil
	}

	var newStatus int

	if d.OrganizationID == nil {
		newStatus = 1
	} else if annotation.LastStatus != nil && annotation.LastStatus.ID < 3 && *d.OrganizationID != 0 {
		newStatus = 2
	} else {
		newStatus = annotation.LastStatus.ID
	}

	status := &Status{}
	utils.GetConnection().Where(newStatus).Find(status)
	m["status"] = status

	tags := []Tag{}
	utils.GetConnection().Where(d.TagsID).Find(&tags)
	m["tags"] = tags
	m["edit_date"] = time.Now()

	return m
}

//CompareTags return true if tags are the same and false instead
func CompareTags(d d.Annotation, a Annotation) bool {
	if len(d.TagsID) != len(a.Tags) {
		return false
	}

	for index, tag := range a.Tags {
		if tag.ID != d.TagsID[index] {
			return false
		}
	}
	return true
}

// GetLastAndFirstStatus return last status and first status, in that order, of annotation or nil if none
func (a Annotation) GetLastAndFirstStatus() (*Status, *Status) {
	if a.Status != nil && len(a.Status) != 0 {
		lastStatus := a.Status[0]
		firstStatus := a.Status[0]
		for _, status := range a.Status {
			if lastStatus.Date.Unix() < status.Date.Unix() {
				lastStatus = status
			} else if lastStatus.Date.Unix() > status.Date.Unix() {
				firstStatus = status
			}
		}
		return &lastStatus, &firstStatus
	}
	return nil, nil
}
