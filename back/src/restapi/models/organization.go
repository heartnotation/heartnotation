package models

// Organization database representation
type Organization struct {
	ID       uint   `json:"id"`
	Name     string `json:"name"`
	IsActive bool   `json:"is_active"`
	Users    []User `json:"users" gorm:"many2many:user_organization;"`
}

// TableName sets table name of the struct
func (Organization) TableName() string {
	return "organization"
}
