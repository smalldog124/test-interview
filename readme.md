# Code Interview for Backend

## Dependency Require
- [docker](https://docs.docker.com/engine/install/)
- [docker-compose](https://docs.docker.com/compose/install/)
- [node v20](https://nodejs.org/en/download)

## Before running
start database
```sh
docker-compose up -d
```
## 1. Data migration
seeding data to mongoDB
```sh
cd data-migration
npm install
node seeding.js
```
run data migration
```sh
node index.js
```

## 2. Real-time Inventory
install dependency
```sh
cd real-time-inventory/server
npm install
```
start server
```sh
node index.js
```

Go to web page

http://localhost:3000/static/index.html

reduce stock
```sh
curl --location 'http://localhost:3000/api/v1/product/reduce-stock' \
--header 'Content-Type: application/json' \
--data '{
    "productId":12347,
    "quantity":2
}'
```

## Clean up data base
```sh
docker-compose down -v
```