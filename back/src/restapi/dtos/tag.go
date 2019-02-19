package dtos

// Tag DTO of an user
type Tag struct {
	ID       *int    `json:"id"`
	Name     *string `json:"name"`
	Color    *string `json:"color"`
	ParentID *int    `json:"parent_id"`
}
