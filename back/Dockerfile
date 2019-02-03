FROM golang:1.11.4

WORKDIR /go/src/app
COPY ./src/hello /go/src/app

RUN go get -d -v ./...
RUN go install -v ./...

EXPOSE 8080

CMD ["app"]
