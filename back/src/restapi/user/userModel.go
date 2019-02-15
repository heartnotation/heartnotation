package user

import (
	o "restapi/organization"
)

// User represent a user in database
type User struct {
	ID            uint             `gorm:"AUTO_INCREMENT" json:"id"`
	Mail          string           `gorm:"type:varchar(100);unique_index" json:"mail"`
	Role          Role             `json:"role"`
	RoleID        *int             `gorm:"TYPE:integer REFERENCES userrole" json:"role_id,integer,omitempty"`
	Organizations []o.Organization `gorm:"many2many:organization_user" json:"organizations,omitempty"`
	IsActive      bool             `json:"is_active"`
}

type dto struct {
	ID uint `json:"id"`
	Mail            string `json:"mail"`
	RoleID          int    `json:"role_id"`
	OrganizationsID []int  `json:"organizations"`
}

// TableName sets table name of the struct
func (User) TableName() string {
	return "userprofile"
}

// Role represent a role in database
type Role struct {
	ID       uint   `gorm:"AUTO_INCREMENT" json:"id"`
	Name     string `json:"name"`
	IsActive bool   `json:"is_active"`
}

// TableName sets table name of the struct
func (Role) TableName() string {
	return "userrole"
}

type OrganizationUser struct {
	IDOrganization uint `json:"organization_id`
	IDUser         uint `json:"user_id`
}

func (OrganizationUser) TableName() string {
	return "organization_user"
}
