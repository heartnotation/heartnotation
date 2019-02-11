package annotation

import (
	o "restapi/organization"
	sig "restapi/signal"
	s "restapi/status"
	t "restapi/tag"
	"time"
)

// Annotation structure to represent an annotation
type Annotation struct {
	ID             int             `json:"id"`
	Name           string          `json:"name"`
	Organization   *o.Organization `gorm:"foreignkey:OrganizationID" json:"organization,omitempty"`
	OrganizationID *int            `json:"organization_id,omitempty"`
	Status         *s.Status       `json:"status"`
	StatusID       *int            `gorm:"TYPE:integer REFERENCES status" json:"status_id,integer,omitempty"`
	SignalID       int             `json:"signal_id"`
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
	Name           string `json:"name"`
	OrganizationID int    `json:"organization_id"`
	SignalID       int    `json:"signal_id"`
	ParentID       int    `json:"parent_id"`
	TagsID         []int  `json:"tags"`
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
