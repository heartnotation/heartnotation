package models

import (
	"time"
)

// Annotation structure to represent an annotation
type Annotation struct {
	ID                int                 `json:"id"`
	Name              string              `json:"name"`
	CreationDate      time.Time           `json:"creation_date"`
	CreationUser      string              `json:"creation_user"`
	EditDate          time.Time           `json:"edit_date"`
	EditUser          string              `json:"edit_user"`
	IsActive          bool                `json:"is_active"`
	IsEditable        bool                `json:"is_editable"`
	SignalID          string              `json:"signal_id"`
	Signal            [][]*Point          `json:"signal,omitempty" gorm:"-"`
	OrganizationID    *int                `json:"-"`
	Organization      Organization        `json:"organization,omitempty" gorm:"foreignkey:OrganizationID"`
	Commentannotation []AnnotationComment `json:"comments,omitempty" gorm:"foreignkey:AnnotationID"`
	Status            []Status            `json:"status,omitempty" gorm:"foreignkey:AnnotationID"`
	LastStatus        *Status             `json:"last_status,omitempty"`
	ParentID          *int                `json:"parent_id,omitempty" gorm:"foreignkey:Parent"`
	Parent            *Annotation         `json:"parent,omitempty"`
	Tags              []Tag               `json:"tags,omitempty" gorm:"many2many:annotation_tag"`
}

// TableName sets table name of the struct
func (Annotation) TableName() string {
	return "annotation"
}
