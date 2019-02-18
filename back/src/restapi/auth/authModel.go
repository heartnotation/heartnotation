package auth

import (
	u "restapi/managers"
)

// GoogleUser is the representation of the datas Google return about a user
type GoogleUser struct {
	ID    string
	Email string
}

type AuthResponse struct {
	Token string `json:"token"`
	User  u.User `json:"user"`
}
