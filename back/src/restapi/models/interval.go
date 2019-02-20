package models

// Interval ORM interval
type Interval struct {
	ID              int               `json:"id"`
	TimeStart       int               `json:"time_start"`
	TimeEnd         int               `json:"time_end"`
	Tags            []Tag             `json:"tags,omitempty" gorm:"many2many:interval_tag;"`
	AnnotationID    int               `json:"-"`
	Annotation      *Annotation       `json:"annotation,omitempty" gorm:"foreignkey:AnnotationID"`
	Commentinterval []IntervalComment `json:"comments,omitempty" gorm:"foreignkey:IntervalID"`
	IsActive        bool              `json:"is_active"`
}

// TableName sets table name of the struct
func (Interval) TableName() string {
	return "interval"
}
