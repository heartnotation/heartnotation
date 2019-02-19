package models

// User represent a user in database
type User struct {
	ID            int            `json:"id"`
	Mail          string         `json:"mail"`
	Organizations []Organization `json:"organizations,omitempty" gorm:"many2many:user_organization"`
	Roles         []Role         `json:"roles,omitempty" gorm:"many2many:user_role;"`
	IsActive      bool           `json:"is_active"`
}

// TableName sets table name of the struct
func (User) TableName() string {
	return "User"
}
