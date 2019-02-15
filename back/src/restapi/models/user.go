package models

// User represent a user in database
type User struct {
	ID            uint           `json:"id"`
	Mail          string         `json:"mail"`
	Organizations []Organization `json:"organizations" gorm:"many2many:user_organization"`
	Roles         []Role         `json:"roles" gorm:"many2many:user_role;"`
	IsActive      bool           `json:"is_active"`
}

// TableName sets table name of the struct
func (User) TableName() string {
	return "user"
}
