package models

import "time"

// IntervalComment database representation
type IntervalComment struct {
	ID         int       `json:"id"`
	Comment    string    `json:"comment"`
	Date       time.Time `json:"date"`
	IntervalID int       `json:"-"`
	Interval   *Interval `json:"interval,omitempty" gorm:"foreignkey:IntervalID"`
	UserID     int       `json:"-"`
	User       User      `json:"user" gorm:"foreignkey:UserID"`
	Tags       []Tag     `json:"tags,omitempty" gorm:"many2many:interval_tag"`
}

// TableName sets table name of the struct
func (IntervalComment) TableName() string {
	return "commentinterval"
}
