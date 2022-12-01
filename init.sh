#!/bin/bash

docker-compose build && docker-compose down --remove-orphans && docker-compose up -d 
docker-compose exec php composer install

