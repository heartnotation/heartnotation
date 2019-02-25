package dtos

// Organization DTO of an organization
type Organization struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	IsActive bool   `json:"is_active"`
}
