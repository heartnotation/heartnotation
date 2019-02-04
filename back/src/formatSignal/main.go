package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
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
		}
	}
	test := []string{"test", "test2"}
	result, err := json.Marshal(test)
	fmt.Println(string(result))
}

func formatData(data []byte, leads int) ([][]int16, error) {
	if len(data)%16 > 0 || len(data)%(16*leads) > 0 {
		return nil, fmt.Errorf("Given leads does not correspond to datas")
	}
	samples := len(data) / 16
	sizeSample := samples / leads

	formatedDatas := make([][]int16, leads)
	reader := bytes.NewReader(data)
	for lead := 0; lead < leads; lead++ {
		formatedDatas[lead] = make([]int16, sizeSample)
	}
	fmt.Println(formatedDatas[0])
	for sample := 0; sample < sizeSample; sample++ {
		for lead := 0; lead < leads; lead++ {
			tmp := (sample * leads * 16) + (lead * 16)
			formatedDatas[lead][sample] = io.ReadFull(reader)
		}
	}
	return formatedDatas, nil
}
