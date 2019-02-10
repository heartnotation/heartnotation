DROP DATABASE IF EXISTS heartnotation;
DROP ROLE IF EXISTS heart;

CREATE USER heart createdb createrole password 'cardiologs';

CREATE DATABASE heartnotation OWNER heart;

\connect heartnotation

-- TABLES INIT

DROP TABLE IF EXISTS ORGANIZATION CASCADE;
CREATE TABLE ORGANIZATION (
	id SERIAL PRIMARY KEY,
	name varchar(30),
	is_active boolean NOT NULL
);

DROP TABLE IF EXISTS STATUS CASCADE;
CREATE TABLE STATUS (
	id SERIAL PRIMARY KEY,
	name varchar(30),
	is_active boolean NOT NULL
);

DROP TABLE IF EXISTS USERROLE CASCADE;
CREATE TABLE USERROLE (
	id SERIAL PRIMARY KEY,
	name varchar(30),
	is_active boolean NOT NULL
);

DROP TABLE IF EXISTS USERPROFILE CASCADE;
CREATE TABLE USERPROFILE (
	id SERIAL PRIMARY KEY,
	role_id bigint REFERENCES USERROLE(id) ON DELETE CASCADE ON UPDATE CASCADE,
	mail varchar(30),
	is_active boolean NOT NULL
);

DROP TABLE IF EXISTS ORGANIZATION_USER CASCADE;
CREATE TABLE ORGANIZATION_USER (
	organization_id bigint,
	user_id bigint,
	PRIMARY KEY(organization_id, user_id),
	CONSTRAINT FK_orga FOREIGN KEY (organization_id) REFERENCES ORGANIZATION(id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT FK_user FOREIGN KEY (user_id) REFERENCES USERPROFILE(id) ON DELETE CASCADE ON UPDATE CASCADE
);

DROP TABLE IF EXISTS ANNOTATION CASCADE;
CREATE TABLE ANNOTATION (
	id SERIAL PRIMARY KEY,
	name varchar(30),
	parent_id bigint REFERENCES ANNOTATION(id) ON DELETE CASCADE ON UPDATE CASCADE,
	organization_id bigint REFERENCES ORGANIZATION(id) ON DELETE CASCADE ON UPDATE CASCADE,
	status_id bigint REFERENCES STATUS(id) ON DELETE CASCADE ON UPDATE CASCADE,
	signal_id bigint NOT NULL,
	annotation_comment varchar(180),
	creation_date timestamp NOT NULL,
	edit_date timestamp NOT NULL,
	is_active boolean NOT NULL,
	is_editable boolean NOT NULL
);

DROP TABLE IF EXISTS INTERVAL CASCADE;
CREATE TABLE INTERVAL (
	id SERIAL PRIMARY KEY,
	timestamp_start int NOT NULL,
	timestamp_end bigint NOT NULL,
	is_active boolean NOT NULL
);

DROP TABLE IF EXISTS ANNOTATIONINTERVAL_USER CASCADE;
CREATE TABLE ANNOTATIONINTERVAL_USER (
	id SERIAL PRIMARY KEY,
	annotation_id bigint REFERENCES ANNOTATION(id) ON DELETE CASCADE ON UPDATE CASCADE,
	interval_id bigint REFERENCES INTERVAL(id) ON DELETE CASCADE ON UPDATE CASCADE,
	user_id bigint REFERENCES USERPROFILE(id) ON DELETE CASCADE ON UPDATE CASCADE,
	comment_date timestamp NOT NULL
);

DROP TABLE IF EXISTS TAG CASCADE;
CREATE TABLE TAG (
	id SERIAL PRIMARY KEY,
	parent_id bigint REFERENCES TAG(id) ON DELETE CASCADE ON UPDATE CASCADE,
	name varchar(30) NOT NULL,
	color varchar(30) NOT NULL,
	is_active boolean NOT NULL
);

DROP TABLE IF EXISTS ANNOTATION_TAG CASCADE;
CREATE TABLE ANNOTATION_TAG (
	id SERIAL PRIMARY KEY,
	annotation_id bigint REFERENCES ANNOTATION(id) ON DELETE CASCADE ON UPDATE CASCADE,
	tag_id bigint REFERENCES TAG(id) ON DELETE CASCADE ON UPDATE CASCADE
);

DROP TABLE IF EXISTS INTERVAL_TAG CASCADE;
CREATE TABLE INTERVAL_TAG (
	id SERIAL PRIMARY KEY,
	interval_id bigint,
	tag_id bigint NOT NULL
);

DROP TABLE IF EXISTS OPERATOR_OF CASCADE;
CREATE TABLE OPERATOR_OF (
	id SERIAL PRIMARY KEY,
	user_id bigint REFERENCES USERPROFILE(id) ON DELETE CASCADE ON UPDATE CASCADE,
	status_id bigint REFERENCES STATUS(id) ON DELETE CASCADE ON UPDATE CASCADE,
	annotation_id bigint REFERENCES ANNOTATION(id) ON DELETE CASCADE ON UPDATE CASCADE,
	operation_time date
);

ALTER TABLE ORGANIZATION OWNER TO heart;
ALTER TABLE STATUS OWNER TO heart;
ALTER TABLE USERROLE OWNER TO heart;
ALTER TABLE USERPROFILE OWNER TO heart;
ALTER TABLE ORGANIZATION_USER OWNER TO heart;
ALTER TABLE ANNOTATION OWNER TO heart;
ALTER TABLE INTERVAL OWNER TO heart;
ALTER TABLE ANNOTATIONINTERVAL_USER OWNER TO heart;
ALTER TABLE TAG OWNER TO heart;
ALTER TABLE INTERVAL_TAG OWNER TO heart;
ALTER TABLE OPERATOR_OF OWNER TO heart;
ALTER TABLE ANNOTATION_TAG OWNER TO heart;

-----------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------

-- DATAS INIT

-- ORGANIZATION

INSERT INTO ORGANIZATION (name, is_active) 
	VALUES ('Cardiologs', TRUE);

INSERT INTO ORGANIZATION (name, is_active) 
	VALUES ('Podologs', TRUE);

INSERT INTO ORGANIZATION (name, is_active) 
	VALUES ('Heartnotalogs', TRUE);

-- USERROLE

INSERT INTO USERROLE (name, is_active) 
	VALUES ('Annotateur', TRUE);

INSERT INTO USERROLE (name, is_active) 
	VALUES ('Gestionnaire', TRUE);

INSERT INTO USERROLE (name, is_active) 
	VALUES ('Admin', TRUE);

--  USERPROFILE

INSERT INTO USERPROFILE (role_id, mail, is_active) 
	VALUES (3, 'rolex@gmail.com', TRUE);

INSERT INTO USERPROFILE (role_id, mail, is_active) 
	VALUES (1, 'marvin@gmail.com', TRUE);

INSERT INTO USERPROFILE (role_id, mail, is_active)  
	VALUES (2, 'sophie@gmail.com', TRUE);

-- STATUS

INSERT INTO STATUS (name, is_active) 
	VALUES ('CREATED', TRUE);

INSERT INTO STATUS (name, is_active)  
	VALUES ('ASSIGNED', TRUE);

INSERT INTO STATUS (name, is_active)  
	VALUES ('IN_PROCESS', TRUE);

INSERT INTO STATUS (name, is_active) 
	VALUES ('COMPLETED', TRUE);

INSERT INTO STATUS (name, is_active) 
	VALUES ('VALIDATED', TRUE);

INSERT INTO STATUS (name, is_active) 
	VALUES ('CANCELED', TRUE);

-- ORGANIZATION USER

INSERT INTO ORGANIZATION_USER (organization_id, user_id) 
	VALUES (1, 3);

INSERT INTO ORGANIZATION_USER (organization_id, user_id) 
	VALUES (2, 1);

INSERT INTO ORGANIZATION_USER (organization_id, user_id) 
	VALUES (3, 2);

-- ANNOTATION

INSERT INTO ANNOTATION (parent_id, name, organization_id, status_id, signal_id, annotation_comment, creation_date, edit_date, is_active, is_editable) 
	VALUES (NULL, 'Annotation 1', 1, 1, 1, 'Première annotation', '2004-10-19 10:23:54', '2012-12-29 17:19:54', TRUE, TRUE);

INSERT INTO ANNOTATION (parent_id, name, organization_id, status_id, signal_id, annotation_comment, creation_date, edit_date, is_active, is_editable)  
	VALUES (NULL, 'Annotation 2', 2, 2, 1, 'Seconde annotation', '2004-10-19 10:23:54', '2012-12-29 17:19:54', TRUE, TRUE);

INSERT INTO ANNOTATION (parent_id, name, organization_id, status_id, signal_id, annotation_comment, creation_date, edit_date, is_active, is_editable) 
	VALUES (2, 'Annotation 3',  3, 3, 1, 'Troisième annotation qui se base sur la deuxième', '2004-10-19 10:23:54', '2012-12-29 17:19:54', TRUE, TRUE);

-- INTERVAL

INSERT INTO INTERVAL (timestamp_start, timestamp_end, is_active) 
	VALUES (3, 4, TRUE);

INSERT INTO INTERVAL (timestamp_start, timestamp_end, is_active)
	VALUES (7, 9, TRUE);

INSERT INTO INTERVAL (timestamp_start, timestamp_end, is_active) 
	VALUES (11, 29, TRUE);

-- ANNOTATIONINTERVAL_USER

INSERT INTO ANNOTATIONINTERVAL_USER (annotation_id, interval_id, user_id, comment_date) 
	VALUES (1, 1, 1, '2004-10-19 10:23:54');

INSERT INTO ANNOTATIONINTERVAL_USER (annotation_id, interval_id, user_id, comment_date) 
	VALUES (1, 2, 1, '2004-10-19 10:23:54');

INSERT INTO ANNOTATIONINTERVAL_USER (annotation_id, interval_id, user_id, comment_date) 
	VALUES (1, 3, 1, '2004-10-19 10:23:54');

-- TAG

INSERT INTO TAG (parent_id, name, color, is_active) 
	VALUES (NULL, 'Lungs on fire', 'red', TRUE);

INSERT INTO TAG (parent_id, name, color, is_active) 
	VALUES (NULL, 'Lungs on water', 'blue', TRUE);

INSERT INTO TAG (parent_id, name, color, is_active) 
	VALUES (2, 'Weird lungs', 'green', TRUE);

-- ANNOTATION_TAG
INSERT INTO ANNOTATION_TAG(annotation_id, tag_id)
	VALUES (1, 1);
INSERT INTO ANNOTATION_TAG(annotation_id, tag_id)
	VALUES (1, 2);
INSERT INTO ANNOTATION_TAG(annotation_id, tag_id)
	VALUES (1, 3);
INSERT INTO ANNOTATION_TAG(annotation_id, tag_id)
	VALUES (2, 1);
INSERT INTO ANNOTATION_TAG(annotation_id, tag_id)
	VALUES (2, 2);
INSERT INTO ANNOTATION_TAG(annotation_id, tag_id)
	VALUES (3, 1);

-- INTERVAL_TAG

INSERT INTO INTERVAL_TAG (interval_id, tag_id) 
	VALUES (1, 1);

INSERT INTO INTERVAL_TAG (interval_id, tag_id) 
	VALUES (1, 2);

INSERT INTO INTERVAL_TAG (interval_id, tag_id) 
	VALUES (1, 3);

-- OPERATOR_OF

INSERT INTO OPERATOR_OF (user_id, status_id, annotation_id, operation_time) 
	VALUES (1, 2, 1, '2004-10-19 10:23:54');

INSERT INTO OPERATOR_OF (user_id, status_id, annotation_id, operation_time) 
	VALUES (1, 3, 1, '2004-10-19 10:23:54');

INSERT INTO OPERATOR_OF (user_id, status_id, annotation_id, operation_time) 
	VALUES (1, 1, 1, '2004-10-19 10:23:54');





