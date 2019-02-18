package models

// Tag database representation
type Tag struct {
	ID          uint         `json:"id" gorm:"AUTO_INCREMENT"`
	ParentID    *uint        `json:"parent_id,omitempty" gorm:"foreignkey:ID"`
	Name        string       `json:"name"`
	Color       string       `json:"color"`
	Annotations []Annotation `json:"users" gorm:"many2many:annotation_tag;"`
	Intervals   []Interval   `json:"intervals" gorm:"many2many:interval_tag;"`
	IsActive    bool         `json:"is_active"`
}

// TableName sets table name of the struct
func (Tag) TableName() string {
	return "tag"
}
