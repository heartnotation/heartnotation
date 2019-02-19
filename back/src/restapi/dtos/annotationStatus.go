package dtos

// AnnotationStatus DTO of annotation status
type AnnotationStatus struct {
	ID         int `json:"id"`
	EnumStatus int `json:"status,omitempty"`
}
