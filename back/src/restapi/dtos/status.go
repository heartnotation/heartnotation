package dtos

// Status DTO of a status
type Status struct {
	ID           *int `json:"id"`
	EnumStatusID *int `json:"enum_status_id"`
	UserID       *int `json:"user_id"`
	AnnotationID *int `json:"annotation_id"`
}
