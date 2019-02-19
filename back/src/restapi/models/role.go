package models

// Role represent a role in database
type Role struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	Users    []User `json:"users,omitempty" gorm:"many2many:user_role;"`
	IsActive bool   `json:"is_active"`
}

// TableName sets table name of the struct
func (Role) TableName() string {
	return "role"
}
