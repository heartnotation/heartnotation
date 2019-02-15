package dtos

// User DTO of an user
type User struct {
	ID              *int    `json:"id"`
	Mail            *string `json:"mail"`
	RoleID          []uint  `json:"role_id"`
	OrganizationsID []uint  `json:"organizations"`
}
