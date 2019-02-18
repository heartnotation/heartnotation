package models

// EnumStatus models of enum status
type EnumStatus struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	IsActive bool   `json:"is_active"`
}

func (EnumStatus) TableName() string {
	return "enumstatus"
}
