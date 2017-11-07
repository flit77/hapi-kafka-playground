# Tweet24

> Using Node.js build a REST API with an endpoint that takes a location – (latitude, longitude) – and return a websocket which streams tweets on a 24 hour delay.
> For example, on Monday at 9am, if I tweet “Good Monday, everybody!” from my office [52.530844, 13.3868664], the server wouldn’t return that tweet until Tuesday at 9am.

A project implemented on node.js using Apache Kafka and configurable to be deployed in the docker containers.

There project splitted into 2 microservies:
* server - web server build with hapy to receive and handle post requests
* consumer - kafka consumer to handle tweets, added with post requests

Please make sure that configuration options are presetted in environment variables or fulfilled in following config files:
* ./consumer/.env
* ./server/.env

Config options that essential to run project:
* KAFKA_CLIENT_URI - path to kafka service
* TOPIC_NAME - reserved topic, that created preliminary in kafka

To run project in microservices:
> docker-compose up
