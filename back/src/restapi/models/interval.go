package models

// Interval ORM interval
type Interval struct {
	ID           uint       `json:"id""`
	TimeStart    int        `json:"time_start"`
	TimeEnd      int        `json:"time_end"`
	Tags         []Tag      `json:"tags" gorm:"many2many:interval_tag;"`
	AnnotationID uint       `json:"annotation_id"`
	Annotation   Annotation `json:"annotation" gorm:"foreignkey:AnnotationID"`
}

// TableName sets table name of the struct
func (Interval) TableName() string {
	return "interval"
}
