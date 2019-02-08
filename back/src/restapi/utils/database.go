package utils

import (
	"fmt"
	"log"
	"os"

	"github.com/jinzhu/gorm"

	// import postgres dialect for ORM
	_ "github.com/jinzhu/gorm/dialects/postgres"
)

var db *gorm.DB

func init() {
	username := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASS")
	dbName := os.Getenv("DB_NAME")
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")

	dbURI := fmt.Sprintf("host=%s user=%s dbname=%s sslmode=disable password=%s port=%s", dbHost, username, dbName, password, dbPort)
	log.Print("Connection pending...")
	conn, err := gorm.Open("postgres", dbURI)
	for err != nil {
		conn, err = gorm.Open("postgres", dbURI)
	}
	db = conn
	log.Print("Connected to database")
}

// GetConnection return database connection
func GetConnection() *gorm.DB {
	return db
}
