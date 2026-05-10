FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod ./
COPY *.go ./
RUN CGO_ENABLED=0 GOOS=linux go build -o main .
FROM alpine:3.19
RUN apk --no-cache add ca-certificates
COPY --from=builder /app/main .
EXPOSE 3003
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3003/health || exit 1
CMD ["./main"]
