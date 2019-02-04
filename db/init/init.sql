DROP DATABASE IF EXISTS heartnotation;
DROP ROLE IF EXISTS heart;

CREATE USER heart createdb createrole password 'cardiologs';

CREATE DATABASE heartnotation OWNER heart;

\connect heartnotation

-- TABLES INIT

DROP TABLE IF EXISTS ORGANIZATION CASCADE;
CREATE TABLE ORGANIZATION (
	organization_id bigint PRIMARY KEY,
	organization_name varchar(30),
	status boolean
);

DROP TABLE IF EXISTS PROCESS CASCADE;
CREATE TABLE PROCESS (
	process_id bigint PRIMARY KEY,
	process_name varchar(30),
	status boolean
);

DROP TABLE IF EXISTS USERROLE CASCADE;
CREATE TABLE USERROLE (
	role_id bigint PRIMARY KEY,
	user_role varchar(30),
	status boolean
);

DROP TABLE IF EXISTS USERPROFILE CASCADE;
CREATE TABLE USERPROFILE (
	user_id bigint PRIMARY KEY,
	role_id bigint REFERENCES USERROLE(role_id) ON DELETE CASCADE ON UPDATE CASCADE,
	mail varchar(30),
	status boolean
);

DROP TABLE IF EXISTS ORGANIZATION_USER CASCADE;
CREATE TABLE ORGANIZATION_USER (
	organization_id bigint,
	user_id bigint,
	PRIMARY KEY(organization_id, user_id),
	CONSTRAINT FK_orga FOREIGN KEY (organization_id) REFERENCES ORGANIZATION(organization_id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT FK_user FOREIGN KEY (user_id) REFERENCES USERPROFILE(user_id) ON DELETE CASCADE ON UPDATE CASCADE
);

DROP TABLE IF EXISTS ANNOTATION CASCADE;
CREATE TABLE ANNOTATION (
	annotation_id bigint PRIMARY KEY,
	annotation_id_parent bigint REFERENCES ANNOTATION(annotation_id) ON DELETE CASCADE ON UPDATE CASCADE,
	organization_id bigint NOT NULL,
	process_id bigint REFERENCES PROCESS(process_id) ON DELETE CASCADE ON UPDATE CASCADE,
	signal_id bigint NOT NULL,
	annotation_comment varchar(180),
	creation_date date NOT NULL,
	edit_date date NOT NULL,
	status boolean
);

DROP TABLE IF EXISTS INTERVAL CASCADE;
CREATE TABLE INTERVAL (
	interval_id bigint PRIMARY KEY,
	timestamp_start int NOT NULL,
	timestamp_end int NOT NULL,
	status boolean
);

DROP TABLE IF EXISTS ANNOTATION_INTERVAL_USER CASCADE;
CREATE TABLE ANNOTATION_INTERVAL_USER (
	annotation_interval_user_id bigint PRIMARY KEY,
	annotation_id bigint REFERENCES ANNOTATION(annotation_id) ON DELETE CASCADE ON UPDATE CASCADE,
	interval_id bigint REFERENCES INTERVAL(interval_id) ON DELETE CASCADE ON UPDATE CASCADE,
	user_id bigint REFERENCES USERPROFILE(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
	comment_date date NOT NULL
);

DROP TABLE IF EXISTS TAG CASCADE;
CREATE TABLE TAG (
	tag_id bigint PRIMARY KEY,
	tag_id_parent bigint REFERENCES TAG(tag_id) ON DELETE CASCADE ON UPDATE CASCADE,
	label varchar(30) NOT NULL,
	color varchar(30) NOT NULL,
	status boolean
);

DROP TABLE IF EXISTS INTERVAL_TAG CASCADE;
CREATE TABLE INTERVAL_TAG (
	interval_id bigint,
	tag_id bigint NOT NULL
);

DROP TABLE IF EXISTS OPERATOR_OF CASCADE;
CREATE TABLE OPERATOR_OF (
	operation_id bigint PRIMARY KEY,
	user_id bigint REFERENCES USERPROFILE(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
	process_id bigint REFERENCES PROCESS(process_id) ON DELETE CASCADE ON UPDATE CASCADE,
	annotation_id bigint REFERENCES ANNOTATION(annotation_id) ON DELETE CASCADE ON UPDATE CASCADE,
	operation_time date
);

-----------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------

-- DATAS INIT

-- ORGANIZATION

INSERT INTO ORGANIZATION (organization_id, organization_name, status) 
	VALUES (1000, 'Cardiologs', TRUE);

INSERT INTO ORGANIZATION (organization_id, organization_name, status) 
	VALUES (1001, 'Podologs', TRUE);

-- ROLE

INSERT INTO USERROLE (role_id, user_role, status) 
	VALUES (1, 'Annotateur', TRUE);

INSERT INTO USERROLE (role_id, user_role, status) 
	VALUES (2, 'Gestionnaire', TRUE);

INSERT INTO USERROLE (role_id, user_role, status) 
	VALUES (3, 'Admin', TRUE);

--  USER

INSERT INTO USERPROFILE (user_id, role_id, mail, status) 
	VALUES (30000, 3, 'rolex@gmail.com', TRUE);

INSERT INTO USERPROFILE (user_id, role_id, mail, status) 
	VALUES (10000, 1, 'marvin@gmail.com', TRUE);

INSERT INTO USERPROFILE (user_id, role_id, mail, status) 
	VALUES (20000, 2, 'sophie@gmail.com', TRUE);

-- PROCESS

INSERT INTO PROCESS (process_id, process_name, status) 
	VALUES (1, 'NEW', TRUE);

INSERT INTO PROCESS (process_id, process_name, status) 
	VALUES (2, 'IN TREATMENT', TRUE);

INSERT INTO PROCESS (process_id, process_name, status) 
	VALUES (3, 'COMPLETED', TRUE);

INSERT INTO PROCESS (process_id, process_name, status) 
	VALUES (4, 'VALIDATED', TRUE);

-- ORGANIZATION USER

INSERT INTO ORGANIZATION_USER (organization_id, user_id) 
	VALUES (1000, 30000);

INSERT INTO ORGANIZATION_USER (organization_id, user_id) 
	VALUES (1001, 10000);

INSERT INTO ORGANIZATION_USER (organization_id, user_id) 
	VALUES (1001, 20000);

-- ANNOTATION

INSERT INTO ANNOTATION (annotation_id, annotation_id_parent, organization_id, process_id, signal_id, annotation_comment, creation_date, edit_date, status) 
	VALUES (1, NULL, 1000, 1, 1, 'Première annotation', '2019/01/11', '2019/01/11', TRUE);

INSERT INTO ANNOTATION (annotation_id, annotation_id_parent, organization_id, process_id, signal_id, annotation_comment, creation_date, edit_date, status) 
	VALUES (2, NULL, 1000, 1, 1, 'Seconde annotation', '2019/01/13', '2019/01/13', TRUE);

INSERT INTO ANNOTATION (annotation_id, annotation_id_parent, organization_id, process_id, signal_id, annotation_comment, creation_date, edit_date, status) 
	VALUES (3, 2, 1000, 1, 1, 'Troisième annotation qui reprend la seconde', '2019/01/18', '2019/01/18', TRUE);

-- INTERVAL

INSERT INTO INTERVAL (interval_id, timestamp_start, timestamp_end, status) 
	VALUES (1, 3, 4, TRUE);

INSERT INTO INTERVAL (interval_id, timestamp_start, timestamp_end, status) 
	VALUES (2, 7, 9, TRUE);

INSERT INTO INTERVAL (interval_id, timestamp_start, timestamp_end, status) 
	VALUES (3, 11, 29, TRUE);

-- ANNOTATION_INTERVAL_USER

INSERT INTO ANNOTATION_INTERVAL_USER (annotation_interval_user_id, annotation_id, interval_id, user_id, comment_date) 
	VALUES (1000, 1, 1, 10000, '2019/01/18');

INSERT INTO ANNOTATION_INTERVAL_USER (annotation_interval_user_id, annotation_id, interval_id, user_id, comment_date) 
	VALUES (1001, 1, 2, 10000, '2019/01/18');

INSERT INTO ANNOTATION_INTERVAL_USER (annotation_interval_user_id, annotation_id, interval_id, user_id, comment_date) 
	VALUES (1002, 1, 3, 10000, '2019/01/18');

-- TAG

INSERT INTO TAG (tag_id, tag_id_parent, label, color, status) 
	VALUES (1, NULL, 'Lungs on fire', 'red', TRUE);

INSERT INTO TAG (tag_id, tag_id_parent, label, color, status) 
	VALUES (2, NULL, 'Lungs on water', 'blue', TRUE);

INSERT INTO TAG (tag_id, tag_id_parent, label, color, status) 
	VALUES (3, NULL, 'Weird lungs', 'green', TRUE);

-- INTERVAL_TAG

INSERT INTO INTERVAL_TAG (interval_id, tag_id) 
	VALUES (1, 1);

INSERT INTO INTERVAL_TAG (interval_id, tag_id) 
	VALUES (1, 2);

INSERT INTO INTERVAL_TAG (interval_id, tag_id) 
	VALUES (1, 3);

-- OPERATOR_OF

INSERT INTO OPERATOR_OF (operation_id, user_id, process_id, annotation_id, operation_time) 
	VALUES (1, 10000, 2, 1, '2019/01/18');

INSERT INTO OPERATOR_OF (operation_id, user_id, process_id, annotation_id, operation_time) 
	VALUES (2, 10000, 3, 1, '2019/01/18');

INSERT INTO OPERATOR_OF (operation_id, user_id, process_id, annotation_id, operation_time) 
	VALUES (3, 10000, 1, 1, '2019/01/18');















