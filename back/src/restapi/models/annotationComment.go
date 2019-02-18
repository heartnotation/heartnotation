package models

import (
	"time"
)

// AnnotationComment database representation
type AnnotationComment struct {
	ID           int        `json:"id"`
	Comment      string     `json:"comment"`
	Date         time.Time  `json:"date"`
	AnnotationID int        `json:"annotation_id,omitempty"`
	Annotation   Annotation `json:"annotation,omitempty" gorm:"foreignkey:AnnotationID"`
	UserID       int        `json:"user_id,omitempty"`
	User         User       `json:"user,omitempty" gorm:"foreignkey:UserID"`
}

// TableName sets table name of the struct
func (AnnotationComment) TableName() string {
	return "commentannotation"
}
