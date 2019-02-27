package dtos

import "time"

// IntervalComment DTO of comment interval
type IntervalComment struct {
	ID         *int       `json:"id"`
	Comment    *string    `json:"comment"`
	Date       *time.Time `json:"date"`
	IntervalID *int       `json:"interval_id"`
	UserID     *int       `json:"user_id"`
}

// IntervalCommentPayload is a struct to send one new comment for specified interval
type IntervalCommentPayload struct {
	IntervalID *int    `json:"interval_id"`
	Comment    *string `json:"comment"`
}
