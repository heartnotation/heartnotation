package dtos

// Interval DTO of an interval
type Interval struct {
	ID           *int  `json:"id"`
	TimeStart    *int  `json:"time_start"`
	TimeEnd      *int  `json:"time_end"`
	Tags         []int `json:"tags"`
	AnnotationID *int  `json:"annotation_id"`
}

// IntervalTagsPayload is a struct to send tags for specified interval
type IntervalTagsPayload struct {
	IntervalID *int  `json:"interval_id"`
	Tags       []int `json:"tags"`
}
