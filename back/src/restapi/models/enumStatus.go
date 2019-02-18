package models

// EnumStatus models of enum status
type EnumStatus struct {
	ID       uint   `json:"id"`
	Name     string `json:"name"`
	IsActive bool   `json:"is_active"`
}

func (EnumStatus) TableName() string {
	return "enumstatus"
}
