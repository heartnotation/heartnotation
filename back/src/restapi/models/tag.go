package models

// Tag database representation
type Tag struct {
	ID          int          `json:"id" gorm:"AUTO_INCREMENT"`
	ParentID    *int         `json:"parent_id,omitempty" gorm:"foreignkey:ID"`
	Name        string       `json:"name"`
	Color       string       `json:"color"`
	Annotations []Annotation `json:"users,omitempty" gorm:"many2many:annotation_tag;PRELOAD:false"`
	Intervals   []Interval   `json:"intervals,omitempty" gorm:"many2many:interval_tag;PRELOAD:false"`
	IsActive    bool         `json:"is_active"`
	Children    []Tag        `json:"children" gorm:"foreignkey:ParentID"`
}

// TableName sets table name of the struct
func (Tag) TableName() string {
	return "tag"
}
