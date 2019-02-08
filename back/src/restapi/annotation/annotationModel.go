package annotation

import (
	o "restapi/organization"
	"time"
)

// Annotation structure to represent an annotation
type Annotation struct {
	ID                uint            `json:"id"`
	AnnotationComment string          `json:"name"`
	Organization      *o.Organization `gorm:"foreignkey:OrganizationID" json:"organization,omitempty"`
	OrganizationID    *uint           `json:"organization_id,omitempty"`
	StatusID          uint            `json:"status_id"`
	SignalID          *uint           `json:"signal_id"`
	CreationDate      time.Time       `json:"creation_date"`
	EditDate          time.Time       `json:"edit_date"`
	IsActive          bool            `gorm:"column:is_active" json:"is_active"`
	Parent            *Annotation     `json:"parent,omitempty"`
	ParentID          *uint           `gorm:"TYPE:integer REFERENCES annotation" json:"parent_id,integer,omitempty"`
}

// TableName sets table name of the struct
func (Annotation) TableName() string {
	return "annotation"
}

// Gui : En vrai, je pense qu'on devrait fusionner les deux struct du coup, a verifier
type Gui struct {
	Annotation Annotation
	Signal     [][]int16 `json:"signal"`
}
