package annotation

import (
	o "restapi/organization"
	"time"
)

// Annotation structure to represent an annotation
type Annotation struct {
	ID                uint           `json:"id"`
	AnnotationComment string         `json:"name"`
	Organization      o.Organization `gorm:"foreignkey:OrganizationID;association_foreign:ID" json:"organization"`
	OrganizationID    uint           `json:"organization_id"`
	ProcessID         uint           `json:"process_id"`
	SignalID          uint           `json:"signal_id"`
	CreationDate      time.Time      `json:"creation_date"`
	EditDate          time.Time      `json:"edit_date"`
	Parent            *Annotation    `gorm:"foreignkey:ParentID;association_foreign:ID" json:"parent"`
	ParentID          uint           `json:"parent_id"`
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
