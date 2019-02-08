package tag

// Tag database representation
type Tag struct {
	ID       uint   `gorm:"AUTO_INCREMENT" json:"id"`
	Parent   *Tag   `json:"parent,omitempty"`
	ParentID *uint  `gorm:"TYPE:integer REFERENCES tag" json:"parent_id,integer,omitempty"`
	Name     string `json:"name"`
	Color    string `json:"color"`
	IsActive bool   `json:"is_active"`
}

// TableName sets table name of the struct
func (Tag) TableName() string {
	return "tag"
}
