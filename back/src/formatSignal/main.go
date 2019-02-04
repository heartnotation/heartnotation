package main

import (
	"bytes"
	"encoding/binary"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
)

func main() {
	fmt.Println("Starting the app")
	response, err := http.Get("https://cardiologsdb.blob.core.windows.net/cardiologs-public/ai/1.bin") //A parametrer
	if err != nil {
		fmt.Println(" FAIL with %s\n", err)
	} else {
		data, err := ioutil.ReadAll(response.Body)
		if err != nil {
			fmt.Println(" FAIL with %s\n", err)
		} else {
			res, _ := formatData(data, 3)
			res2, _ := json.Marshal(res)

			fmt.Println(string(res2))
			fmt.Println(data)
		}
	}
}

func formatData(data []byte, leads int) ([][]int16, error) {
	if len(data)%16 > 0 || len(data)%(16*leads) > 0 {
		return nil, fmt.Errorf("Given leads does not correspond to datas")
	}
	samples := len(data) / 2
	fmt.Println(len(data), ":", samples)
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
