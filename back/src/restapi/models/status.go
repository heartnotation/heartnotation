package models

import (
	"time"
)

type Status struct {
	ID           int        `json:"id"`
	Date         time.Time  `json:"date"`
	EnumStatusID int        `json:"organization_id,omitempty"`
	EnumStatus   EnumStatus `json:"enum_status" gorm:"foreignkey:EnumStatusID"`
	AnnotationID int        `json:"annotation_id,omitempty"`
	Annotation   Annotation `json:"annotation" gorm:"foreignkey:AnnotationID"`
	UserID       int        `json:"user_id"`
	User         User       `json:"user" gorm:"foreignkey:UserID"`
}

func (Status) TableName() string {
	return "status"
}
