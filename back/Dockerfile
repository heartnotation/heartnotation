FROM golang:1.11.4

WORKDIR /go/src
COPY ./src/restapi /go/src/restapi

RUN go get -d -v ./...
RUN go install -v ./...

EXPOSE 8000

CMD ["restapi"]