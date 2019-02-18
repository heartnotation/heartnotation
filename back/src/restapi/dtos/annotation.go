package dtos

// Annotation DTO of annotation
type Annotation struct {
	Name           *string `json:"name"`
	OrganizationID *int    `json:"organization_id"`
	SignalID       *int    `json:"signal_id"`
	ParentID       *int    `json:"parent_id"`
	TagsID         []int   `json:"tags"`
}
