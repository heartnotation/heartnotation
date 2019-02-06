package user

import (
	// Organization database representation
	_ "github.com/jinzhu/gorm"
)

// Profile represent a user in database
type Profile struct {
	ID       uint   `gorm:"AUTO_INCREMENT"`
	Mail     string `gorm:"type:varchar(100);unique_index"`
	Role     Role   `gorm:"foreignkey:ID"`
	IsActive bool
}

// Role represent a role in database
type Role struct {
	ID       uint `gorm:"AUTO_INCREMENT"`
	Name     string
	IsActive bool
}
