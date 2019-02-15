package models

import (
	"time"
)

type Status struct {
	ID           uint       `json:"id"`
	Date         time.Time  `json:"date"`
	EnumStatusID uint       `json:"organization_id,omitempty"`
	EnumStatus   EnumStatus `json:"enum_status" gorm:"foreignkey:EnumStatusID"`
	AnnotationID uint       `json:"annotation_id,omitempty"`
	Annotation   Annotation `json:"annotation" gorm:"foreignkey:AnnotationID"`
	UserID       uint       `json:"user_id"`
	User         User       `json:"user" gorm:"foreignkey:UserID"`
}

func (Status) TableName() string {
	return "status"
}
