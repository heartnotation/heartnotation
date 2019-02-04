package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
)

func main() {
	fmt.Println("Starting the app")
	response, err := http.Get("https://cardiologsdb.blob.core.windows.net/cardiologs-public/ai/1.bin")
	if err != nil {
		fmt.Println(" FAIL with %s\n", err)
	} else {
		data, err := ioutil.ReadAll(response.Body)
		if err != nil {
			fmt.Println(" FAIL with %s\n", err)
		} else {
			formatData(data, 3)
			//fmt.Println(data)
		}
	}
	test := []string{"test", "test2"}
	result, err := json.Marshal(test)
	fmt.Println(string(result))
}

func formatData(data []byte, leads int) ([][][]byte, error) {
	if len(data)%16 > 0 || len(data)%(16*leads) > 0 {
		return nil, fmt.Errorf("Given leads does not correspond to datas")
	}
	samples := len(data) / 16
	sizeSample := samples / leads
	fmt.Println(len(data), samples, sizeSample)

	formatedDatas := make([][][]byte, leads)

	for lead := 0; lead < leads; lead++ {
		formatedDatas[lead] = make([][]byte, sizeSample)
		for sample := 0; sample < 16; sample++ {
			formatedDatas[lead][sample] = make([]byte, 16)
		}
	}
	fmt.Println(formatedDatas[0])
	for sample := 0; sample < sizeSample; sample++ {
		for lead := 0; lead < leads; lead++ {
			tmp := (sample * leads * 16) + (lead * 16)
			fmt.Println(len(data), samples, sizeSample)
			fmt.Println("Line ", tmp, ":")
			fmt.Println(data[tmp : tmp+16])
			formatedDatas[lead][sample] = data[tmp : tmp+16]
			fmt.Println(formatedDatas[lead][sample])
		}
	}
	return formatedDatas, nil
}
