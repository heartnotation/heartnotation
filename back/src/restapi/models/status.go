package models

import (
	"time"
)

type Status struct {
	ID           uint       `json:"id"`
	Date         time.Time  `json:"date"`
	EnumStatusID uint       `json:"enumstatus_id"`
	EnumStatus   EnumStatus `json:"enum_status" gorm:"foreignkey:EnumStatusID"`
	AnnotationID uint       `json:"annotation_id,omitempty"`
	Annotation   Annotation `json:"annotation,omitempty" gorm:"foreignkey:AnnotationID;PRELOAD:false"`
	UserID       uint       `json:"user_id"`
	User         User       `json:"user" gorm:"foreignkey:UserID"`
}

func (Status) TableName() string {
	return "status"
}
