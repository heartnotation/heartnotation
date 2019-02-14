package interval

import (
	a "restapi/annotation"
	t "restapi/tag"
	u "restapi/user"
	"time"
)

// Interval ORM interval
type Interval struct {
	ID             uint    `gorm:"AUTO_INCREMENT;primary_key:true;" json:"id"`
	TimestampStart int64   `json:"start"`
	TimestampEnd   int64   `json:"end"`
	Tags           []t.Tag `json:"tags,omitempty" gorm:"many2many:interval_tag;"`
}

// Comment ORM interval_comment
type Comment struct {
	ID           uint         `json:"id" gorm:"AUTO_INCREMENT;primary_key:true;"`
	AnnotationID uint         `json:"annotation_id"`
	Annotation   a.Annotation `json:"annotation" gorm:"foreignkey:AnnotationID"`
	IntervalID   *uint        `json:"interval_id,omitempty"`
	Interval     Interval     `json:"interval" gorm:"foreignkey:IntervalID"`
	UserID       uint         `json:"user_id"`
	User         u.User       `json:"user" gorm:"foreignkey:UserID"`
	Comment      string       `json:"comment,omitempty"`
	Date         time.Time    `json:"date"`
}

// IntCom ORM interval comment
type IntCom struct {
	Interval Interval  `json:"interval"`
	Comment  []Comment `json:"comment"`
}

// Payload interval payload
type Payload struct {
	AnnotationID *uint   `json:"annotation_id"`
	ID           *uint   `json:"id"`
	UserID       *uint   `json:"user_id"`
	Comment      *string `json:"comment"`
	Start        *int64  `json:"start"`
	End          *int64  `json:"end"`
	TagsID       []uint  `json:"tags"`
}

// TableName sets table name of the struct
func (Comment) TableName() string {
	return "annotation_interval_user"
}

// TableName sets table name of the struct
func (Interval) TableName() string {
	return "interval"
}
