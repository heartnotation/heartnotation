package annotation

import (
	o "restapi/organization"
	s "restapi/status"
	"time"
)

// Annotation structure to represent an annotation
type Annotation struct {
	ID             uint            `json:"id"`
	Name           string          `json:"name"`
	Organization   *o.Organization `gorm:"foreignkey:OrganizationID" json:"organization,omitempty"`
	OrganizationID *uint           `json:"organization_id,omitempty"`
	Status         *s.Status       `json:"status"`
	StatusID       *uint           `gorm:"TYPE:integer REFERENCES status" json:"status_id,integer,omitempty"`
	SignalID       uint            `json:"signal_id"`
	CreationDate   time.Time       `json:"creation_date"`
	EditDate       time.Time       `json:"edit_date"`
	IsActive       bool            `json:"is_active"`
	IsEditable     bool            `json:"is_editable"`
	Parent         *Annotation     `json:"parent,omitempty"`
	ParentID       *uint           `gorm:"TYPE:integer REFERENCES annotation" json:"parent_id,integer,omitempty"`
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
