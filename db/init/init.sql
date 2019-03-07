DROP DATABASE IF EXISTS heartnotation;
DROP ROLE IF EXISTS heart;

CREATE USER heart createdb createrole
password 'cardiologs';

CREATE DATABASE heartnotation
OWNER heart;

\connect heartnotation

-- TABLES INIT



------------------------------------------------------------
-- Table: Role
------------------------------------------------------------
CREATE TABLE public.Role
(
	id SERIAL NOT NULL ,
	name VARCHAR (50) NOT NULL ,
	is_active BOOL NOT NULL  ,
	CONSTRAINT Role_PK PRIMARY KEY (id)
)
WITHOUT OIDS;


------------------------------------------------------------
-- Table: User
------------------------------------------------------------
CREATE TABLE public.User
(
	id SERIAL NOT NULL ,
	mail VARCHAR (50) NOT NULL ,
	is_active BOOL NOT NULL ,
	role_id INT NOT NULL  ,
	CONSTRAINT User_PK PRIMARY KEY (id)
)
WITHOUT OIDS;


------------------------------------------------------------
-- Table: Organization
------------------------------------------------------------
CREATE TABLE public.Organization
(
	id SERIAL NOT NULL ,
	name VARCHAR (50) NOT NULL ,
	is_active BOOL NOT NULL  ,
	CONSTRAINT Organization_PK PRIMARY KEY (id)
)
WITHOUT OIDS;


------------------------------------------------------------
-- Table: EnumStatus
------------------------------------------------------------
CREATE TABLE public.EnumStatus
(
	id SERIAL NOT NULL ,
	name VARCHAR (50) NOT NULL ,
	is_active BOOL NOT NULL  ,
	CONSTRAINT EnumStatus_PK PRIMARY KEY (id)
)
WITHOUT OIDS;

------------------------------------------------------------
-- Table: User_Organization
------------------------------------------------------------
CREATE TABLE public.User_Organization
(
	organization_id INT NOT NULL ,
	user_id INT NOT NULL  ,
	CONSTRAINT User_Organization_PK PRIMARY KEY (organization_id,user_id)
)
WITHOUT OIDS;


------------------------------------------------------------
-- Table: Tag
------------------------------------------------------------
CREATE TABLE public.Tag
(
	id SERIAL NOT NULL ,
	name VARCHAR (50) NOT NULL ,
	color CHAR (7) NOT NULL ,
	is_active BOOL NOT NULL ,
	parent_id INT    ,
	CONSTRAINT Tag_PK PRIMARY KEY (id)
)
WITHOUT OIDS;


------------------------------------------------------------
-- Table: Interval
------------------------------------------------------------
CREATE TABLE public.Interval
(
	id SERIAL NOT NULL ,
	time_start INT NOT NULL ,
	time_end INT NOT NULL ,
	is_active BOOL NOT NULL ,
	annotation_id INT NOT NULL  ,
	CONSTRAINT Interval_PK PRIMARY KEY (id)
)
WITHOUT OIDS;


------------------------------------------------------------
-- Table: Annotation
------------------------------------------------------------
CREATE TABLE public.Annotation
(
	id SERIAL NOT NULL ,
	name VARCHAR (50) NOT NULL ,
	signal_id VARCHAR (30) NOT NULL ,
	creation_date TIMESTAMP NOT NULL ,
	edit_date TIMESTAMP   ,
	is_active BOOL NOT NULL ,
	is_editable BOOL NOT NULL ,
	organization_id INT,
	parent_id INT    ,
	CONSTRAINT Annotation_PK PRIMARY KEY (id)
)
WITHOUT OIDS;


------------------------------------------------------------
-- Table: CommentInterval
------------------------------------------------------------
CREATE TABLE public.CommentInterval
(
	id SERIAL NOT NULL ,
	comment VARCHAR (500) NOT NULL ,
	date TIMESTAMP NOT NULL ,
	interval_id INT NOT NULL ,
	user_id INT NOT NULL  ,
	CONSTRAINT CommentInterval_PK PRIMARY KEY (id)
)
WITHOUT OIDS;


------------------------------------------------------------
-- Table: Status
------------------------------------------------------------
CREATE TABLE public.Status
(
	id SERIAL NOT NULL ,
	date TIMESTAMP NOT NULL ,
	annotation_id INT NOT NULL ,
	enumstatus_id INT NOT NULL ,
	user_id INT NOT NULL  ,
	CONSTRAINT Status_PK PRIMARY KEY (id)
)
WITHOUT OIDS;


------------------------------------------------------------
-- Table: CommentAnnotation
------------------------------------------------------------
CREATE TABLE public.CommentAnnotation
(
	id SERIAL NOT NULL ,
	comment VARCHAR (500) NOT NULL ,
	date TIMESTAMP NOT NULL ,
	annotation_id INT NOT NULL ,
	user_id INT NOT NULL  ,
	CONSTRAINT CommentAnnotation_PK PRIMARY KEY (id)
)
WITHOUT OIDS;


------------------------------------------------------------
-- Table: Annotation_Tag
------------------------------------------------------------
CREATE TABLE public.Annotation_Tag
(
	tag_id INT NOT NULL ,
	annotation_id INT NOT NULL  ,
	CONSTRAINT Annotation_Tag_PK PRIMARY KEY (tag_id,annotation_id)
)
WITHOUT OIDS;


------------------------------------------------------------
-- Table: Interval_Tag
------------------------------------------------------------
CREATE TABLE public.Interval_Tag
(
	interval_id INT NOT NULL ,
	tag_id INT NOT NULL  ,
	CONSTRAINT Interval_Tag_PK PRIMARY KEY (interval_id,tag_id)
)
WITHOUT OIDS;


ALTER TABLE public.User
	ADD CONSTRAINT User_Role0_FK
	FOREIGN KEY (role_id)
	REFERENCES public.Role(id);

ALTER TABLE public.User_Organization
	ADD CONSTRAINT User_Organization_Organization0_FK
	FOREIGN KEY (organization_id)
	REFERENCES public.Organization(id);

ALTER TABLE public.User_Organization
	ADD CONSTRAINT User_Organization_User1_FK
	FOREIGN KEY (user_id)
	REFERENCES public.User(id);

ALTER TABLE public.Tag
	ADD CONSTRAINT Tag_Tag0_FK
	FOREIGN KEY (parent_id)
	REFERENCES public.Tag(id);

ALTER TABLE public.Interval
	ADD CONSTRAINT Interval_Annotation0_FK
	FOREIGN KEY (annotation_id)
	REFERENCES public.Annotation(id);

ALTER TABLE public.Annotation
	ADD CONSTRAINT Annotation_Organization0_FK
	FOREIGN KEY (organization_id)
	REFERENCES public.Organization(id);

ALTER TABLE public.Annotation
	ADD CONSTRAINT Annotation_Annotation1_FK
	FOREIGN KEY (parent_id)
	REFERENCES public.Annotation(id);

ALTER TABLE public.CommentInterval
	ADD CONSTRAINT CommentInterval_Interval0_FK
	FOREIGN KEY (interval_id)
	REFERENCES public.Interval(id)
	ON DELETE CASCADE;

ALTER TABLE public.CommentInterval
	ADD CONSTRAINT CommentInterval_User1_FK
	FOREIGN KEY (user_id)
	REFERENCES public.User(id);

ALTER TABLE public.Status
	ADD CONSTRAINT Status_Annotation0_FK
	FOREIGN KEY (annotation_id)
	REFERENCES public.Annotation(id);

ALTER TABLE public.Status
	ADD CONSTRAINT Status_EnumStatus1_FK
	FOREIGN KEY (enumstatus_id)
	REFERENCES public.EnumStatus(id);

ALTER TABLE public.Status
	ADD CONSTRAINT Status_User2_FK
	FOREIGN KEY (user_id)
	REFERENCES public.User(id);

ALTER TABLE public.CommentAnnotation
	ADD CONSTRAINT CommentAnnotation_Annotation0_FK
	FOREIGN KEY (annotation_id)
	REFERENCES public.Annotation(id);

ALTER TABLE public.CommentAnnotation
	ADD CONSTRAINT CommentAnnotation_User1_FK
	FOREIGN KEY (user_id)
	REFERENCES public.User(id);

ALTER TABLE public.Annotation_Tag
	ADD CONSTRAINT Annotation_Tag_Tag0_FK
	FOREIGN KEY (tag_id)
	REFERENCES public.Tag(id);

ALTER TABLE public.Annotation_Tag
	ADD CONSTRAINT Annotation_Tag_Annotation1_FK
	FOREIGN KEY (annotation_id)
	REFERENCES public.Annotation(id);

ALTER TABLE public.Interval_Tag
	ADD CONSTRAINT Interval_Tag_Interval0_FK
	FOREIGN KEY (interval_id)
	REFERENCES public.Interval(id)
	ON DELETE CASCADE;

ALTER TABLE public.Interval_Tag
	ADD CONSTRAINT Interval_Tag_Tag1_FK
	FOREIGN KEY (tag_id)
	REFERENCES public.Tag(id);


ALTER TABLE public.Tag OWNER TO heart;
ALTER TABLE public.Interval OWNER TO heart;
ALTER TABLE public.Annotation OWNER TO heart;
ALTER TABLE public.CommentInterval OWNER TO heart;
ALTER TABLE public.Role OWNER TO heart;
ALTER TABLE public.User OWNER TO heart;
ALTER TABLE public.Organization OWNER TO heart;
ALTER TABLE public.Status OWNER TO heart;
ALTER TABLE public.EnumStatus OWNER TO heart;
ALTER TABLE public.CommentAnnotation OWNER TO heart;
ALTER TABLE public.Annotation_Tag OWNER TO heart;
ALTER TABLE public.User_Organization OWNER TO heart;
ALTER TABLE public.Interval_Tag OWNER TO heart;

-----------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------

-- DATAS INIT

-- ORGANIZATION

INSERT INTO public.Organization
	(name, is_active)
VALUES
	('Cardiologs', TRUE);

INSERT INTO public.Organization
	(name, is_active)
VALUES
	('Podologs', TRUE);

INSERT INTO public.Organization
	(name, is_active)
VALUES
	('Heartnotalogs', TRUE);

INSERT INTO public.Organization
	(name, is_active)
VALUES
	('Gynecologs', TRUE);

-- USERROLE

INSERT INTO public.Role
	(name, is_active)
VALUES
	('Annotateur', TRUE);

INSERT INTO public.Role
	(name, is_active)
VALUES
	('Gestionnaire', TRUE);

INSERT INTO public.Role
	(name, is_active)
VALUES
	('Admin', TRUE);

--  User
INSERT INTO public.User
	(mail, is_active, role_id)
VALUES
	('holandertheo@gmail.com', TRUE, 3);

INSERT INTO public.User
	(mail, is_active, role_id)
VALUES
	('rolex.taing@gmail.com', TRUE, 3);

INSERT INTO public.User
	(mail, is_active, role_id)
VALUES
	('marvin.leclerc31@gmail.com', TRUE, 2);

INSERT INTO public.User
	(mail, is_active, role_id)
VALUES
	('socarboni@gmail.com', TRUE, 1);

INSERT INTO public.User
	(mail, is_active, role_id)
VALUES
	('romain.phet@gmail.com', TRUE, 1);

INSERT INTO public.User
	(mail, is_active, role_id)
VALUES
	('alex.pliez@gmail.com', TRUE, 2);

INSERT INTO public.User
	(mail, is_active, role_id)
VALUES
	('saidkhalid1996@gmail.com', TRUE, 1);

INSERT INTO public.User
	(mail, is_active, role_id)
VALUES
	('heartnotation@gmail.com', TRUE, 3);

INSERT INTO public.User
	(mail, is_active, role_id)
VALUES
	('gestion.heart@gmail.com', TRUE, 2);

INSERT INTO public.User
	(mail, is_active, role_id)
VALUES
	('annotateur.heart@gmail.com', TRUE, 1);

-- ENUMSTATUS

INSERT INTO public.EnumStatus
	(name, is_active)
VALUES
	('CREATED', TRUE);

INSERT INTO public.EnumStatus
	(name, is_active)
VALUES
	('ASSIGNED', TRUE);

INSERT INTO public.EnumStatus
	(name, is_active)
VALUES
	('IN_PROCESS', TRUE);

INSERT INTO public.EnumStatus
	(name, is_active)
VALUES
	('COMPLETED', TRUE);

INSERT INTO public.EnumStatus
	(name, is_active)
VALUES
	('VALIDATED', TRUE);

INSERT INTO public.EnumStatus
	(name, is_active)
VALUES
	('CANCELED', TRUE);


-- ORGANIZATION USER
-- Marvin
INSERT INTO public.User_Organization
	(organization_id, user_id)
VALUES
	(1, 3);
-- Marvin
INSERT INTO public.User_Organization
	(organization_id, user_id)
VALUES
	(2, 3);
-- Marvin
INSERT INTO public.User_Organization
	(organization_id, user_id)
VALUES
	(3, 3);
-- Théo
INSERT INTO public.User_Organization
	(organization_id, user_id)
VALUES
	(3, 1);
-- Rolex
INSERT INTO public.User_Organization
	(organization_id, user_id)
VALUES
	(2, 2);
-- Sophie	
INSERT INTO public.User_Organization
	(organization_id, user_id)
VALUES
	(2, 4);
-- Romain
INSERT INTO public.User_Organization
	(organization_id, user_id)
VALUES
	(4, 5);
-- Alex
INSERT INTO public.User_Organization
	(organization_id, user_id)
VALUES
	(4, 6);
-- Said
INSERT INTO public.User_Organization
	(organization_id, user_id)
VALUES
	(4, 7);
-- Annotateur
INSERT INTO public.User_Organization
	(organization_id, user_id)
VALUES
	(1, 10);

-- TAG

INSERT INTO public.Tag
	(parent_id, name, color, is_active)
VALUES
	(NULL, 'Physical Activity', '#570784', TRUE);

INSERT INTO public.Tag
	(parent_id, name, color, is_active)
VALUES
	(1, 'Running', '#F0A202', TRUE);

INSERT INTO public.Tag
	(parent_id, name, color, is_active)
VALUES
	(1, 'Bike', '#C50000', TRUE);

INSERT INTO public.Tag
	(parent_id, name, color, is_active)
VALUES
	(1, 'Rest', '#D63898', TRUE);

INSERT INTO public.Tag
	(parent_id, name, color, is_active)
VALUES
	(NULL, 'Brain Activity', '#009FFD', TRUE);

INSERT INTO public.Tag
	(parent_id, name, color, is_active)
VALUES
	(5, 'Eyes opened', '#85002F', TRUE);

INSERT INTO public.Tag
	(parent_id, name, color, is_active)
VALUES
	(5, 'Eyes closed', '#FFC43A', TRUE);

INSERT INTO public.Tag
	(parent_id, name, color, is_active)
VALUES
	(NULL, 'Heart Activity', '#B80500', TRUE);

INSERT INTO public.Tag
	(parent_id, name, color, is_active)
VALUES
	(8, 'P', '#51C43F', TRUE);

INSERT INTO public.Tag
	(parent_id, name, color, is_active)
VALUES
	(8, 'QRS', '#2F8B8F', TRUE);

INSERT INTO public.Tag
	(parent_id, name, color, is_active)
VALUES
	(8, 'T', '#ED544C', TRUE);

INSERT INTO public.Tag
	(parent_id, name, color, is_active)
VALUES
	(NULL, 'Square wave Activity', '#0a8013', TRUE);

INSERT INTO public.Tag
	(parent_id, name, color, is_active)
VALUES
	(12, 'True', '#20bfdf', TRUE);

INSERT INTO public.Tag
	(parent_id, name, color, is_active)
VALUES
	(12, 'False', '#f11313', TRUE);
