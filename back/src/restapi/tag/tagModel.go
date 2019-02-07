package tag

// Tag database representation
type Tag struct {
	ID       uint   `gorm:"AUTO_INCREMENT" json:"id"`
	ParentID uint   `json:"tag_id_parent,omitempty"`
	Title    string `json:"title"`
	Color    string `json:"color"`
	IsActive bool   `json:"is_active"`
}

// TableName sets table name of the struct
func (Tag) TableName() string {
	return "tag"
}
