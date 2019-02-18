DROP DATABASE IF EXISTS heartnotation;
DROP ROLE IF EXISTS heart;

CREATE USER heart createdb createrole password 'cardiologs';

CREATE DATABASE heartnotation OWNER heart;

\connect heartnotation

-- TABLES INIT

<<<<<<< HEAD
DROP TABLE IF EXISTS Tag ;
CREATE TABLE Tag (id SERIAL NOT NULL,
name VARCHAR(50),
color CHAR(7),
is_active BOOL,
parent_id INT,
PRIMARY KEY (id));

DROP TABLE IF EXISTS Interval ;
CREATE TABLE Interval (id SERIAL NOT NULL,
time_start INT,
time_end INT,
is_active BOOL,
annotation_id INT,
PRIMARY KEY (id));

DROP TABLE IF EXISTS Annotation ;
CREATE TABLE Annotation (id SERIAL NOT NULL,
name VARCHAR(50),
signal_id INT,
creation_date TIMESTAMP,
edit_date TIMESTAMP,
is_active BOOL,
is_editable BOOL,
organization_id INT,
parent_id INT,
PRIMARY KEY (id));

DROP TABLE IF EXISTS CommentInterval ;
CREATE TABLE CommentInterval (id SERIAL NOT NULL,
comment VARCHAR(500),
date TIMESTAMP,
interval_id INT,
user_id INT,
PRIMARY KEY (id));

DROP TABLE IF EXISTS Role ;
CREATE TABLE Role (id SERIAL NOT NULL,
name VARCHAR(50),
is_active BOOL,
PRIMARY KEY (id));

DROP TABLE IF EXISTS "User" ;
CREATE TABLE "User" (id SERIAL NOT NULL,
mail VARCHAR(50),
is_active BOOL,
PRIMARY KEY (id));

DROP TABLE IF EXISTS Organization ;
CREATE TABLE Organization (id SERIAL NOT NULL,
name VARCHAR(50),
is_active BOOL,
PRIMARY KEY (id));

DROP TABLE IF EXISTS Status ;
CREATE TABLE Status (id SERIAL NOT NULL,
date TIMESTAMP,
annotation_id INT,
enumstatus_id INT,
user_id INT,
PRIMARY KEY (id));

DROP TABLE IF EXISTS EnumStatus ;
CREATE TABLE EnumStatus (id SERIAL NOT NULL,
name VARCHAR(50),
is_active BOOL,
PRIMARY KEY (id));

DROP TABLE IF EXISTS CommentAnnotation ;
CREATE TABLE CommentAnnotation (id SERIAL NOT NULL,
comment VARCHAR(500),
date TIMESTAMP,
annotation_id INT,
user_id INT,
PRIMARY KEY (id));

DROP TABLE IF EXISTS Notification ;
CREATE TABLE Notification (id SERIAL NOT NULL,
title VARCHAR(50),
content VARCHAR(500),
date TIMESTAMP,
user_id INT,
PRIMARY KEY (id));

DROP TABLE IF EXISTS Annotation_Tag ;
CREATE TABLE Annotation_Tag (annotation_id INT NOT NULL,
tag_id INT NOT NULL,
PRIMARY KEY (annotation_id,
 tag_id));

DROP TABLE IF EXISTS User_Role ;
CREATE TABLE User_Role (role_id INT NOT NULL,
user_id INT NOT NULL,
PRIMARY KEY (role_id,
 user_id));

DROP TABLE IF EXISTS User_Organization ;
CREATE TABLE User_Organization (user_id INT NOT NULL,
organization_id INT NOT NULL,
PRIMARY KEY (user_id,
 organization_id));

DROP TABLE IF EXISTS Interval_Tag ;
CREATE TABLE Interval_Tag (tag_id INT NOT NULL,
interval_id INT NOT NULL,
PRIMARY KEY (tag_id,
 interval_id));

ALTER TABLE Interval ADD CONSTRAINT FK_Interval_id_Annotation FOREIGN KEY (annotation_id) REFERENCES Annotation (id);

ALTER TABLE Annotation ADD CONSTRAINT FK_Annotation_id_Organization FOREIGN KEY (organization_id) REFERENCES Organization (id);
ALTER TABLE CommentInterval ADD CONSTRAINT FK_CommentInterval_id_Interval FOREIGN KEY (interval_id) REFERENCES Interval (id);
ALTER TABLE CommentInterval ADD CONSTRAINT FK_CommentInterval_id_User FOREIGN KEY (user_id) REFERENCES "User" (id);
ALTER TABLE Status ADD CONSTRAINT FK_Status_id_Annotation FOREIGN KEY (annotation_id) REFERENCES Annotation (id);
ALTER TABLE Status ADD CONSTRAINT FK_Status_id_EnumStatus FOREIGN KEY (enumstatus_id) REFERENCES EnumStatus (id);
ALTER TABLE Status ADD CONSTRAINT FK_Status_id_User FOREIGN KEY (user_id) REFERENCES "User" (id);
ALTER TABLE CommentAnnotation ADD CONSTRAINT FK_CommentAnnotation_id_Annotation FOREIGN KEY (annotation_id) REFERENCES Annotation (id);
ALTER TABLE CommentAnnotation ADD CONSTRAINT FK_CommentAnnotation_id_User FOREIGN KEY (user_id) REFERENCES "User" (id);
ALTER TABLE Notification ADD CONSTRAINT FK_Notification_id_User FOREIGN KEY (user_id) REFERENCES "User" (id);
ALTER TABLE Annotation_Tag ADD CONSTRAINT FK_Annotation_Tag_id_Annotation FOREIGN KEY (annotation_id) REFERENCES Annotation (id);
ALTER TABLE Annotation_Tag ADD CONSTRAINT FK_Annotation_Tag_id_Tag FOREIGN KEY (tag_id) REFERENCES Tag (id);
ALTER TABLE User_Role ADD CONSTRAINT FK_User_Role_id_Role FOREIGN KEY (role_id) REFERENCES Role (id);
ALTER TABLE User_Role ADD CONSTRAINT FK_User_Role_id_User FOREIGN KEY (user_id) REFERENCES "User" (id);
ALTER TABLE User_Organization ADD CONSTRAINT FK_User_Organization_id_User FOREIGN KEY (user_id) REFERENCES "User" (id);
ALTER TABLE User_Organization ADD CONSTRAINT FK_User_Organization_id_Organization FOREIGN KEY (organization_id) REFERENCES Organization (id);
ALTER TABLE Interval_Tag ADD CONSTRAINT FK_Interval_Tag_id_Tag FOREIGN KEY (tag_id) REFERENCES Tag (id);
ALTER TABLE Interval_Tag ADD CONSTRAINT FK_Interval_Tag_id_Interval FOREIGN KEY (interval_id) REFERENCES Interval (id);
ALTER TABLE Tag ADD CONSTRAINT FK_Tag_parent FOREIGN KEY (parent_id) REFERENCES Tag (id);
ALTER TABLE Annotation ADD CONSTRAINT FK_Annotation_parent FOREIGN KEY (parent_id) REFERENCES Annotation (id);

ALTER TABLE Tag OWNER TO heart;
ALTER TABLE Interval OWNER TO heart;
ALTER TABLE Annotation OWNER TO heart;
ALTER TABLE CommentInterval OWNER TO heart;
ALTER TABLE Role OWNER TO heart;
ALTER TABLE "User" OWNER TO heart;
ALTER TABLE Organization OWNER TO heart;
ALTER TABLE Status OWNER TO heart;
ALTER TABLE EnumStatus OWNER TO heart;
ALTER TABLE CommentAnnotation OWNER TO heart;
ALTER TABLE Notification OWNER TO heart;
ALTER TABLE Annotation_Tag OWNER TO heart;
ALTER TABLE User_Role OWNER TO heart;
ALTER TABLE User_Organization OWNER TO heart;
ALTER TABLE Interval_Tag OWNER TO heart;

-----------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------

-- DATAS INIT

-- ORGANIZATION

INSERT INTO Organization (name, is_active) 
	VALUES ('Cardiologs', TRUE);

INSERT INTO Organization (name, is_active) 
	VALUES ('Podologs', TRUE);

INSERT INTO Organization (name, is_active) 
	VALUES ('Heartnotalogs', TRUE);

INSERT INTO Organization (name, is_active) 
	VALUES ('Gynecologs', TRUE);

-- USERROLE

INSERT INTO Role (name, is_active) 
	VALUES ('Annotateur', TRUE);

INSERT INTO Role (name, is_active) 
	VALUES ('Gestionnaire', TRUE);

INSERT INTO Role (name, is_active) 
	VALUES ('Admin', TRUE);

--  User
INSERT INTO "User" (mail, is_active)  
	VALUES ('holandertheo@gmail.com', TRUE);

INSERT INTO "User" (mail, is_active) 
	VALUES ('rolex.taing@gmail.com', TRUE);

INSERT INTO "User" (mail, is_active) 
	VALUES ('marvin.leclerc31@gmail.com', TRUE);

INSERT INTO "User" (mail, is_active)  
	VALUES ('socarboni@gmail.com', TRUE);

INSERT INTO "User" (mail, is_active)  
	VALUES ('romain.phet@gmail.com', TRUE);

INSERT INTO "User" (mail, is_active)  
	VALUES ('alex.pliez@gmail.com', TRUE);

INSERT INTO "User" (mail, is_active)  
	VALUES ('saidkhalid1996@gmail.com', TRUE);


-- USERROLE
INSERT INTO User_Role(user_id, role_id) 
	VALUES (1, 3);

INSERT INTO User_Role(user_id, role_id) 
	VALUES (2, 3);

INSERT INTO User_Role(user_id, role_id) 
	VALUES (3, 2);

INSERT INTO User_Role(user_id, role_id) 
	VALUES (4, 1);

INSERT INTO User_Role(user_id, role_id) 
	VALUES (5, 1);

INSERT INTO User_Role(user_id, role_id) 
	VALUES (6, 2);

INSERT INTO User_Role(user_id, role_id) 
	VALUES (7, 1);


-- ENUMSTATUS

INSERT INTO EnumStatus (name, is_active) 
	VALUES ('CREATED', TRUE);

INSERT INTO EnumStatus (name, is_active)  
	VALUES ('ASSIGNED', TRUE);

INSERT INTO EnumStatus (name, is_active)  
	VALUES ('IN_PROCESS', TRUE);

INSERT INTO EnumStatus (name, is_active) 
	VALUES ('COMPLETED', TRUE);

INSERT INTO EnumStatus (name, is_active) 
	VALUES ('VALIDATED', TRUE);

INSERT INTO EnumStatus (name, is_active) 
	VALUES ('CANCELED', TRUE);


-- ORGANIZATION USER
-- Marvin
INSERT INTO User_Organization (organization_id, user_id) 
	VALUES (1, 3);
-- Marvin
INSERT INTO User_Organization (organization_id, user_id) 
	VALUES (2, 3);
-- Marvin
INSERT INTO User_Organization (organization_id, user_id) 
	VALUES (3, 3);
-- Théo
INSERT INTO User_Organization (organization_id, user_id) 
	VALUES (3, 1);
-- Rolex
INSERT INTO User_Organization (organization_id, user_id) 
	VALUES (2, 2);
-- Sophie	
INSERT INTO User_Organization (organization_id, user_id) 
	VALUES (2, 4);
-- Romain
INSERT INTO User_Organization (organization_id, user_id) 
	VALUES (4, 5);
-- Alex
INSERT INTO User_Organization (organization_id, user_id) 
	VALUES (4, 6);
-- Said
INSERT INTO User_Organization (organization_id, user_id) 
	VALUES (4, 7);


-- ANNOTATION
INSERT INTO Annotation (parent_id, name, organization_id, signal_id, creation_date, edit_date, is_active, is_editable) 
	VALUES (NULL, 'Annotation 1', 1, 1, '2004-10-19 10:23:54', '2012-12-29 17:19:54', TRUE, TRUE);

INSERT INTO Annotation (parent_id, name, organization_id, signal_id, creation_date, edit_date, is_active, is_editable)  
	VALUES (NULL, 'Annotation 2', 2, 1, '2004-10-19 10:23:54', '2012-12-29 17:19:54', TRUE, TRUE);

INSERT INTO Annotation (parent_id, name, organization_id, signal_id, creation_date, edit_date, is_active, is_editable) 
	VALUES (2, 'Annotation 3',  3, 1, '2004-10-19 10:23:54', '2012-12-29 17:19:54', TRUE, TRUE);

-- INTERVAL

INSERT INTO Interval (time_start, time_end, is_active, annotation_id) 
	VALUES (3, 4, TRUE, 1);

INSERT INTO Interval (time_start, time_end, is_active, annotation_id)
	VALUES (7, 9, TRUE, 1);

INSERT INTO Interval (time_start, time_end, is_active, annotation_id) 
	VALUES (11, 29, TRUE, 2);


-- CommentInterval

INSERT INTO CommentInterval (interval_id, user_id, comment, date) 
	VALUES (1, 1, 'HOLLY', '2004-10-19 10:23:54');

INSERT INTO CommentInterval (interval_id, user_id, comment, date) 
	VALUES (2, 1, 'MOLLY', '2004-10-19 10:23:54');

INSERT INTO CommentInterval (interval_id, user_id, comment, date) 
	VALUES (3, 1, 'gOdsAkE', '2004-10-19 10:23:54');

-- TAG

INSERT INTO Tag (parent_id, name, color, is_active) 
	VALUES (NULL, 'Lungs on fire', 'red', TRUE);

INSERT INTO Tag (parent_id, name, color, is_active) 
	VALUES (NULL, 'Lungs on water', 'blue', TRUE);

INSERT INTO Tag (parent_id, name, color, is_active) 
	VALUES (2, 'Weird lungs', 'green', TRUE);

-- ANNOTATION_TAG

INSERT INTO Annotation_Tag(annotation_id, tag_id)
	VALUES (1, 1);
INSERT INTO Annotation_Tag(annotation_id, tag_id)
	VALUES (1, 2);
INSERT INTO Annotation_Tag(annotation_id, tag_id)
	VALUES (1, 3);
INSERT INTO Annotation_Tag(annotation_id, tag_id)
	VALUES (2, 1);
INSERT INTO Annotation_Tag(annotation_id, tag_id)
	VALUES (2, 2);
INSERT INTO Annotation_Tag(annotation_id, tag_id)
	VALUES (3, 1);

-- INTERVAL_TAG

INSERT INTO Interval_Tag (interval_id, tag_id) 
	VALUES (1, 1);

INSERT INTO Interval_Tag (interval_id, tag_id) 
	VALUES (1, 2);

INSERT INTO Interval_Tag (interval_id, tag_id) 
	VALUES (1, 3);

-- Status

INSERT INTO Status (user_id, enumstatus_id, annotation_id, date) 
	VALUES (1, 2, 1, '2004-10-19 10:23:54');

INSERT INTO Status (user_id, enumstatus_id, annotation_id, date) 
	VALUES (1, 3, 1, '2004-10-19 10:23:54');

INSERT INTO Status (user_id, enumstatus_id, annotation_id, date) 
	VALUES (1, 1, 1, '2004-10-19 10:23:54');

-- CommentAnnotation

INSERT INTO CommentAnnotation (annotation_id, user_id, comment, date) 
	VALUES (1, 2, 'The lungs are presenting an incredible amount of water which is coming from an unresolved source', '2004-10-19 10:23:54');

INSERT INTO CommentAnnotation (annotation_id, user_id, comment, date) 
	VALUES (1, 3, 'Lungs are actually defectuous due to drugs injections and too much inhale of smoke', '2004-10-19 10:23:54');

INSERT INTO CommentAnnotation (annotation_id, user_id, comment, date) 
	VALUES (1, 1, '80% of the cause is daily smoke and sniffing white rails', '2004-10-19 10:23:54');
