package models

import (
	"time"
)

type Status struct {
	ID           int        `json:"id"`
	Date         time.Time  `json:"date"`
	EnumStatusID int        `json:"enumstatus_id,omitempty"`
	EnumStatus   EnumStatus `json:"enumstatus" gorm:"foreignkey:EnumStatusID"`
	AnnotationID int        `json:"annotation_id,omitempty"`
	Annotation   Annotation `json:"annotation" gorm:"foreignkey:AnnotationID;PRELOAD:false"`
	UserID       int        `json:"user_id"`
	User         User       `json:"user" gorm:"foreignkey:UserID"`
}

func (Status) TableName() string {
	return "status"
}
