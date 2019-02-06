package annotation

import (
	o "restapi/organization"
	"time"

	"github.com/jinzhu/gorm"
)

// Annotation structure to represent an annotation
type Annotation struct {
	gorm.Model
	ID           uint `gorm:"AUTO_INCREMENT"`
	Parent       *Annotation
	Organization o.Organization
	ProcessID    uint
	SignalID     uint
	Comment      string
	CreatedAt    time.Time
	UpdatedAt    time.Time
	IsActive     bool
}
