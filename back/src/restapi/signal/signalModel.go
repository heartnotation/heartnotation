package signal

import (
	"bytes"
	"encoding/binary"
	"fmt"
)

// FormatData take signal's bytes and rearrange them by leads instead of by sample
func FormatData(data []byte, leads int) ([][]int16, error) {
	int16NumberOfByte := 2
	if len(data)%int16NumberOfByte > 0 || len(data)%(int16NumberOfByte*leads) > 0 {
		return nil, fmt.Errorf("Given leads does not correspond to datas")
	}
	samples := len(data) / int16NumberOfByte
	sizeSample := samples / leads

	formatedDatas := make([][]int16, leads)
	buffer := bytes.NewBuffer(data)
	for lead := 0; lead < leads; lead++ {
		formatedDatas[lead] = make([]int16, sizeSample)
	}
	for sample := 0; sample < sizeSample; sample++ {
		for lead := 0; lead < leads; lead++ {
			binary.Read(buffer, binary.BigEndian, &formatedDatas[lead][sample])
		}
	}
	return formatedDatas, nil
}
