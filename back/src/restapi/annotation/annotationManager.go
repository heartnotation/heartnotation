package annotation

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
)

func CreateAnnotation(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, http.StatusText(405), 405)
		return
	}

	db, err := sql.Open("postgres", "postgres://user:pass@localhost/bookstore")
	if err != nil {
		log.Fatal(err)
	}

	params := mux.Vars(r)
	var annotation Annotation
	creationDate := time.Now()

	annotation.IDSignal = params["idSignal"]
	annotation.OrganizationName = params["organizationName"]
	annotation.Comment = params["annotationComment"]
	annotation.CreationDate = creationDate.Format("2019-02-04")
	if annotation.OrganizationName != "" {
		annotation.Status = "Assignéé"
	} else {
		annotation.Status = "Créée"
	}

	if annotation.IDSignal == "" || annotation.Comment == "" {
		http.Error(w, http.StatusText(400), 400)
		return
	}

	result, err := db.Exec("INSERT INTO ANNOTATION VALUES($1, NULL, $2, $3, $4, $5, $6, NULL, $7)", annotation.IDAnnotation, annotation.OrganizationName, annotation.Status, annotation.Comment, annotation.CreationDate)
	if err != nil {
		http.Error(w, http.StatusText(500), 500)
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		http.Error(w, http.StatusText(500), 500)
		return
	}

	fmt.Fprintf(w, "Annotation %s successfully created (%d row affected)\n", annotation.IDAnnotation, rowsAffected)
}
