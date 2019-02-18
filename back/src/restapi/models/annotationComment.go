package models

import (
	"time"
)

// AnnotationComment database representation
type AnnotationComment struct {
	ID           uint       `json:"id"`
	Comment      string     `json:"comment"`
	Date         time.Time  `json:"date"`
	AnnotationID uint       `json:"annotation_id,omitempty"`
	Annotation   Annotation `json:"annotation,omitempty" gorm:"foreignkey:AnnotationID"`
	UserID       uint       `json:"user_id,omitempty"`
	User         User       `json:"user,omitempty" gorm:"foreignkey:UserID"`
}

// TableName sets table name of the struct
func (AnnotationComment) TableName() string {
	return "commentannotation"
}
