package organization

import (
	// import to have gorm types
	_ "github.com/jinzhu/gorm"

	user "restapi/user"
)

// Organization database representation
type Organization struct {
	ID        uint `gorm:"AUTO_INCREMENT"`
	Name      string
	Employees []user.Profile `gorm:"many2many:organization_user"`
	IsActive  bool
}
