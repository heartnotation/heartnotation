package models

import (
	"time"
)

// Status status model
type Status struct {
	ID           int         `json:"id"`
	Date         time.Time   `json:"date"`
	EnumstatusID int         `json:"-"`
	EnumStatus   EnumStatus  `json:"enum_status" gorm:"foreignkey:EnumstatusID"`
	AnnotationID *int        `json:"annotation_id,omitempty"`
	Annotation   *Annotation `json:"annotation,omitempty" gorm:"foreignkey:AnnotationID;PRELOAD:false"`
	UserID       *int        `json:"-"`
	User         User        `json:"user" gorm:"foreignkey:UserID"`
}

//TableName status table name
func (Status) TableName() string {
	return "status"
}
