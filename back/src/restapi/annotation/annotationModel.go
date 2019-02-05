package annotation

type Annotation struct {
	IDAnnotation       int    `json:idAnnotation`
	IDAnnotationParent int    `json:idAnnotationParent`
	OrganizationID     int    `json:idOrganization`
	ProcessID          int    `json:idProcess`
	IDSignal           int    `json:idSignal`
	Comment            string `json:"annotationComment"`
	CreationDate       string `json:"creationDate"`
	EditDate           string `json:"editDate"`
	Status             bool   `json:"status"`
}
