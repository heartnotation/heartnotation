package models

import (
	"time"
)

// Annotation structure to represent an annotation
type Annotation struct {
	ID             uint         `json:"id"`
	Name           string       `json:"name"`
	CreationDate   time.Time    `json:"creation_date"`
	EditDate       time.Time    `json:"edit_date"`
	IsActive       bool         `json:"is_active"`
	IsEditable     bool         `json:"is_editable"`
	SignalID       uint         `json:"signal_id"`
	Signal         [][]*Point   `json:"signal,omitempty" gorm:"-"`
	OrganizationID uint         `json:"organization_id,omitempty"`
	Organization   Organization `json:"organization,omitempty" gorm:"foreignkey:OrganizationID"`
	ParentID       *uint        `json:"parent_id,omitempty" gorm:"foreignkey:Parent"`
	Parent         *Annotation  `json:"parent,omitempty"`
	Tags           []Tag        `json:"tags,omitempty" gorm:"many2many:annotation_tag"`
}

// TableName sets table name of the struct
func (Annotation) TableName() string {
	return "annotation"
}
