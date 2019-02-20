package annotation

import (
	o "restapi/organization"
	sig "restapi/signal"
	s "restapi/status"
	t "restapi/tag"
	"restapi/utils"
	"time"
)

// Annotation structure to represent an annotation
type Annotation struct {
	ID             int             `json:"id"`
	Name           string          `json:"name"`
	Organization   *o.Organization `json:"organization,omitempty"`
	OrganizationID *int            `gorm:"TYPE:integer REFERENCES organization" json:"organization_id,omitempty"`
	Status         *s.Status       `json:"status"`
	StatusID       *int            `gorm:"TYPE:integer REFERENCES status" json:"status_id,integer,omitempty"`
	SignalID       string          `json:"signal_id"`
	Signal         [][]*sig.Point  `gorm:"-" json:"signal,omitempty"`
	CreationDate   time.Time       `json:"creation_date"`
	EditDate       time.Time       `json:"edit_date"`
	IsActive       bool            `json:"is_active"`
	IsEditable     bool            `json:"is_editable"`
	Parent         *Annotation     `json:"parent,omitempty"`
	ParentID       *int            `gorm:"TYPE:integer REFERENCES annotation" json:"parent_id,integer,omitempty"`
	Tags           []t.Tag         `gorm:"many2many:annotation_tag" json:"tags,omitempty"`
}

type dto struct {
	ID             int    `json:"id"`
	Name           string `json:"name"`
	OrganizationID int    `json:"organization_id,omitempty"`
	SignalID       string `json:"signal_id,omitempty"`
	ParentID       int    `json:"parent_id,omitempty"`
	TagsID         []int  `json:"tags,omitempty"`
	StatusID       int    `json:"status_id,omitempty"`
}

// TableName sets table name of the struct
func (Annotation) TableName() string {
	return "annotation"
}

// Gui : Gui aspects of annotation
type Gui struct {
	Annotation Annotation
	Signal     [][]int16 `json:"signal"`
}

func (d dto) toMap(annotation Annotation) map[string]interface{} {
	m := make(map[string]interface{})
	m["id"] = d.ID
	m["name"] = d.Name

	orga := &o.Organization{}
	if err := utils.GetConnection().Where(d.OrganizationID).Find(orga).Error; err != nil {
		orga = nil
	}

	m["organization"] = orga
	m["organization_id"] = nil

	var newStatus uint

	if uint(d.StatusID) != annotation.Status.ID {
		newStatus = uint(d.StatusID)
	} else {
		if d.OrganizationID == 0 {
			newStatus = 1
		} else if annotation.Status.ID < 3 && d.OrganizationID != 0 {
			newStatus = 2
		} else {
			newStatus = annotation.Status.ID
		}
	}

	status := &s.Status{}
	utils.GetConnection().Where(newStatus).Find(status)
	m["status"] = status

	tags := []t.Tag{}
	utils.GetConnection().Where(d.TagsID).Find(&tags)
	m["tags"] = tags
	m["edit_date"] = time.Now()

	return m
}

func compareTags(d dto, a Annotation) bool {
	if len(d.TagsID) != len(a.Tags) {
		return false
	}

	for index, tag := range a.Tags {
		if tag.ID != uint(d.TagsID[index]) {
			return false
		}
	}
	return true
}
