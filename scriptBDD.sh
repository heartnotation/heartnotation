#!/bin/bash
sudo rm -fr db/datas/
sudo docker rm $(docker ps -a -q)
sudo docker rmi $(docker images -q)
sudo docker system prune --volumes
sudo docker system prune
sudo docker-compose up -V database