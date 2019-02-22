package models

import (
	"time"
)

// Status status model
type Status struct {
	ID           int         `json:"id"`
	Date         time.Time   `json:"date"`
	EnumstatusID *int        `json:"-"`
	EnumStatus   *EnumStatus `json:"enum_status,omitempty" gorm:"foreignkey:EnumstatusID"`
	AnnotationID *int        `json:"-"`
	Annotation   *Annotation `json:"annotation,omitempty" gorm:"foreignkey:AnnotationID;PRELOAD:false"`
	UserID       *int        `json:"-"`
	User         *User       `json:"user,omitempty" gorm:"foreignkey:UserID"`
}

//TableName status table name
func (Status) TableName() string {
	return "status"
}
