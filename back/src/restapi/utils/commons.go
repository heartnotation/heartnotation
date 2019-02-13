package utils

import "strconv"

// IsStringInt check if a string is an int
func IsStringInt(v string) bool {
	if _, err := strconv.Atoi(v); err == nil {
		return true
	}
	return false
}

// MapValues give the values of the map in array format
func MapValues(m map[string]string) []string {
	l := make([]string, 0, len(m))
	for _, val := range m {
		l = append(l, val)
	}
	return l
}
