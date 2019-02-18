package dtos

// User DTO of an user
type User struct {
	ID              *int    `json:"id"`
	Mail            *string `json:"mail"`
	RolesID         []int   `json:"role_id"`
	OrganizationsID []int   `json:"organizations"`
}
