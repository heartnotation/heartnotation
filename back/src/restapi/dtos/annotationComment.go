package dtos

import "time"

// AnnotationComment database representation
type AnnotationComment struct {
	ID           *int       `json:"id"`
	Comment      *string    `json:"comment"`
	Date         *time.Time `json:"date"`
	AnnotationID *int       `json:"annotation_id,omitempty"`
	UserID       *int       `json:"user_id,omitempty"`
}
