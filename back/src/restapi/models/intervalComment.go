package models

import "time"

// IntervalComment database representation
type IntervalComment struct {
	ID         uint      `json:"id"`
	Comment    string    `json:"comment"`
	Date       time.Time `json:"date"`
	IntervalID uint      `json:"interval_id,omitempty"`
	Interval   Interval  `json:"interval" gorm:"foreignkey:AnnotationID"`
	UserID     uint      `json:"user_id"`
	User       User      `json:"user" gorm:"foreignkey:UserID"`
}

// TableName sets table name of the struct
func (IntervalComment) TableName() string {
	return "commentinterval"
}
