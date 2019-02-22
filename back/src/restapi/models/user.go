package models

// User represent a user in database
type User struct {
	ID            int            `json:"id"`
	Mail          string         `json:"mail"`
	Organizations []Organization `json:"organizations,omitempty" gorm:"many2many:user_organization"`
	RoleID        int            `json:"-"`
	Role          *Role          `json:"role,omitempty" gorm:"foreignkey:RoleID"`
	IsActive      bool           `json:"is_active"`
}

// TableName sets table name of the struct
func (User) TableName() string {
	return "user"
}
