package annotation

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"time"

	s "restapi/signal"

	// import pq driver
	_ "github.com/lib/pq"

	u "restapi/utils"
)

func RemoveAnnotation(w http.ResponseWriter, r *http.Request) {

}

// CreateAnnotation function which receive a POST request and return a fresh-new annotation
func CreateAnnotation(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, http.StatusText(405), 405)
		return
	}

	db := u.GetConnection()

	var annotation Annotation

	json.NewDecoder(r.Body).Decode(&annotation)

	date := time.Now()
	annotation.CreationDate = date
	annotation.EditDate = date
	annotation.IsActive = true

	if *(annotation.OrganizationID) != 0 {
		annotation.StatusID = 2
	} else {
		annotation.StatusID = 1
	}
	err := db.Preload("Organization").Create(&annotation).Error
	if err != nil {
		http.Error(w, err.Error(), 400)
		return
	}

	a := &Annotation{}
	e := db.Preload("Organization").Preload("Parent").Find(&a).Error
	if e != nil {
		http.Error(w, e.Error(), 503)
		return
	}
	a.OrganizationID = nil
	if a.Parent != nil {
		a.Parent.OrganizationID = nil
		a.ParentID = nil
	}
	u.Respond(w, a)

}

// FindAnnotations receive request to get all annotations in database
func FindAnnotations(w http.ResponseWriter, r *http.Request) {
	annotations := &[]Annotation{}
	err := u.GetConnection().Preload("Organization").Find(&annotations).Error
	if err != nil {
		http.Error(w, err.Error(), 404)
		return
	} else if err != nil {
		http.Error(w, http.StatusText(500), 500)
		return
	}
	u.Respond(w, annotations)
}

/*
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
		&annotation.is_active)
	if err == sql.ErrNoRows {
		http.NotFound(w, r)
		return
	} else if err != nil {
		http.Error(w, http.StatusText(500), 500)
		return
	}

	// annot, err := json.Marshal(annotation)
	// if err != nil {
	// 	log.Println(err)
	// }

	// fmt.Fprintf(w, "%s\n", string(annot))
}
*/
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
