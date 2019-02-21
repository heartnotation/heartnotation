package models

import (
	"bytes"
	"encoding/binary"
	"fmt"
)

// Point represent a point of a signal
type Point struct {
	X float64 `json:"x"`
	Y int16   `json:"y"`
}

// FormatData take signal's bytes and rearrange them by leads instead of by sample
func FormatData(data []byte, leads int) ([][]*Point, error) {
	int16NumberOfByte := 2
	if len(data)%int16NumberOfByte > 0 || len(data)%(int16NumberOfByte*leads) > 0 {
		return nil, fmt.Errorf("Given leads does not correspond to datas")
	}
	dataSize := len(data)
	leadSize := int64((dataSize / int16NumberOfByte) / leads)

	formatedDatas := make([][]*Point, leads)
	buffer := bytes.NewBuffer(data)
	for lead := 0; lead < leads; lead++ {
		formatedDatas[lead] = make([]*Point, leadSize)
	}
	var sample int64
	var value int16
	for sample = 0; sample < leadSize; sample++ {
		for lead := 0; lead < leads; lead++ {
			if err := binary.Read(buffer, binary.BigEndian, &value); err != nil {
				return nil, err
			}
			formatedDatas[lead][sample] = &Point{X: (float64(sample) / 250), Y: value}
		}
	}
	return formatedDatas, nil
}
