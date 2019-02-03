#!/bin/bash
if [[ $TRAVIS_PULL_REQUEST == "false" ]] && [[ $TRAVIS_BRANCH == "master" ]]; then
    echo  $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin;
    docker tag $APP:$TAG $APP:$TRAVIS_BUILD_NUMBER;
    docker push $APP:TRAVIS_BUILD_NUMBER;
fi
docker push $APP:$TAG
