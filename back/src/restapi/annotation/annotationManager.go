package annotation

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"time"

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
