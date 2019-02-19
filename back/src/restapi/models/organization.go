package models

// Organization database representation
type Organization struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	IsActive bool   `json:"is_active"`
	Users    []User `json:"users,omitempty" gorm:"many2many:user_organization;"`
}

// TableName sets table name of the struct
func (Organization) TableName() string {
	return "organization"
}
