drop database if exists accounts;
drop role if exists tholander;

-- create the requested sinfonifry user

create user tholander createdb createrole password 'root';

-- create a sinfonifry database
create database accounts owner tholander;

\connect accounts

DROP TABLE if exists matable;
CREATE TABLE matable (
  my_idd int NOT NULL, -- The primary key
  CONSTRAINT "pk_id" PRIMARY KEY (my_idd)
);

ALTER TABLE matable OWNER TO tholander;
