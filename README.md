[![Build status](https://defradev.visualstudio.com/DEFRA_FutureFarming/_apis/build/status/defra-ff-mine-support-user-service)](https://defradev.visualstudio.com/DEFRA_FutureFarming/_build/latest?definitionId=562)

# Mine Support User Service
Digital service mock to claim public money in the event property subsides into mine shaft.  The user service receives user data and if it doesn’t already exist saves it in a Postgresql database table.

# Environment variables
|Name|Description|Required|Default|Valid|Notes|
|---|---|:---:|---|---|---|
|NODE_ENV|Node environment|no|development|development,test,production||
|PORT|Port number|no|3002|||
|POSTGRES_USERNAME|Postgres username|yes||||
|POSTGRES_PASSWORD|Postgres password|yes||||

# Prerequisites
Node v10+
PostgreSQL

# Running the application
The application is designed to run as a container via Docker Compose or Kubernetes (with Helm).

A convenience script is provided to run via Docker Compose:

`scripts/start`

This will create the required `mine-support` network before starting the service so that it can communicate with other Mine Support services running alongside it through docker-compose. The script will then attach to the running service, tailing its logs and allowing the service to be brought down by pressing `Ctrl + C`.

# Kubernetes
The service has been developed with the intention of running in Kubernetes.  A helm chart is included in the `.\helm` folder.

# How to run tests
Unit tests are written in Lab and can be run with the following command:

`npm run test`
