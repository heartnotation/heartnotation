#!/bin/bash
echo nJyG#cg2hY5BoB | docker login -u heartnotation --password-stdin
docker build --build-arg api=http://heartnotation.local:8080 --build-arg client_id=172888593948-qm2mn5jrrint8saav1hndus58583ll34.apps.googleusercontent.com -t heartnotation/web-app:latest ./front
docker build -t heartnotation/rest-api:latest ./back
docker build -t heartnotation/database:latest ./db

docker push heartnotation/rest-api:latest
docker push heartnotation/web-app:latest
docker push heartnotation/database:latest
