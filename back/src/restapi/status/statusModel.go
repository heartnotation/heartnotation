package status

type Status struct {
	ID       uint   `gorm:"AUTO_INCREMENT" json:"id"`
	Name     string `json:"name"`
	IsActive bool   `json:"is_active"`
}

func (Status) TableName() string {
	return "status"
}
