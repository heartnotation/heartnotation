package test

import (
	"encoding/json"
	"testing"

	s "restapi/signal"

	"github.com/stretchr/testify/assert"
)

func TestFormatData(t *testing.T) {

	data := make([]byte, 6)
	for i := byte(0); i < 6; i++ {
		data[i] = i
	}

	res, err := s.FormatData(data, 3)
	resAsJSON, _ := json.Marshal(res)

	assert.Equal(t, string(resAsJSON), "[[1],[515],[1029]]")
	assert.Equal(t, err, nil)
}
