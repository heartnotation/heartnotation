FROM golang:1.11.4

WORKDIR /go/src
COPY ./src/restapi /go/src/restapi

WORKDIR /go/src/restapi
RUN curl https://raw.githubusercontent.com/golang/dep/master/install.sh | sh \
    dep ensure -vendor-only \
    go build

EXPOSE 8000

CMD ["restapi"]