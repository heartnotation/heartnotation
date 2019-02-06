package annotation

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"time"
	"fmt"

	s "restapi/signal"

	// import pq driver
	_ "github.com/lib/pq"

	u "restapi/utils"
)

func verifyCode409(w http.ResponseWriter, err error) error {
	if err != nil {
		http.Error(w, err.Error(), 409)
		return err
	}
	return nil
}

func verifyDBConnection() *sql.DB {
	db, err := sql.Open("postgres", "user=heart password=cardiologs dbname=heartnotation sslmode=disable host=database")
	if err != nil {
		log.Fatal(err)
	}
	return db
}

// CreateAnnotation function which receive a POST request and return a fresh-new annotation
func CreateAnnotation(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, http.StatusText(405), 405)
		return
	}

	db := u.GetConnection()

	bodyBytes, _ := ioutil.ReadAll(r.Body)
	r.Body = ioutil.NopCloser(bytes.NewBuffer(bodyBytes))

	var annotation Annotation
	annotation.CreatedAt = time.Now()
	annotation.UpdatedAt = time.Now()
	json.Unmarshal(bodyBytes, &annotation)

	if annotation.Organization.ID != 0 {
		annotation.ProcessID = 2
	} else {
		annotation.ProcessID = 1
	}

	if annotation.Comment == "" {
		http.Error(w, http.StatusText(400), 400)
		return
	}
	res := db.Create(&annotation)
	if res.Error != nil {
		http.Error(w, res.Error.Error(), 402)
		return
	}
	u.Respond(w, annotation)
}

// Get annotation by ID using GET Request
func getAnnotation(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, http.StatusText(405), 405)
		return
	}
	annID := r.FormValue("id")
	if annID == "" {
		http.Error(w, http.StatusText(400), 400)
		return
	}
	db := verifyDBConnection()
	row := db.QueryRow("SELECT * FROM annotation where annotation_id = $1", annID)
	annotation := Annotation{}
	err := row.Scan(&annotation.ID, &annotation.Parent,
		&annotation.Organization, &annotation.ProcessID, &annotation.SignalID,
		&annotation.Comment, &annotation.CreatedAt, &annotation.UpdatedAt,
		&annotation.IsActive)
	if err == sql.ErrNoRows {
		http.NotFound(w, r)
		return
	} else if err != nil {
		http.Error(w, http.StatusText(500), 500)
		return
	}

	annot, err := json.Marshal(annotation)
	if err != nil {
		log.Println(err)
	}

	fmt.Fprintf(w, "%s\n", string(annot))
}

func formatToJSONFromAPI(api string) ([]byte, error) {
	httpResponse, err := http.Get(api) //A parametrer
	if err != nil {
		return nil, err
	}

	dataBrut, err := ioutil.ReadAll(httpResponse.Body)
	if err != nil {
		return nil, err
	}

	signalFormated, err := s.FormatData(dataBrut, 3)
	if err != nil {
		return nil, err
	}

	var gui Gui
	gui.Signal = signalFormated

	jsonDatas, err := json.Marshal(gui)
	if err != nil {
		return nil, err
	}
	return jsonDatas, nil
}

//En attente de brancher avec le web (route de recuperation d'une annotation)
func incompleteTestForSignal() {
	response, err := formatToJSONFromAPI("https://cardiologsdb.blob.core.windows.net/cardiologs-public/ai/1.bin") //A parametrer
	if err != nil {
		fmt.Println(" FAIL with \n", err)
	}

	fmt.Println(string(response))
}
