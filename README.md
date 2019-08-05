[![Build Status](https://defradev.visualstudio.com/DEFRA_FutureFarming/_apis/build/status/DEFRA.mine-support-user-service?branchName=master)](https://defradev.visualstudio.com/DEFRA_FutureFarming/_build/latest?definitionId=594&branchName=master)

# Mine Support User Service
Digital service mock to claim public money in the event property subsides into mine shaft.  The user service receives user data and if it doesn’t already exist saves it in a Postgresql database table.

# Environment variables
|Name|Description|Required|Default|Valid|Notes|
|---|---|:---:|---|---|---|
|NODE_ENV|Node environment|no|development|development,test,production||
|PORT|Port number|no|3002|||
|POSTGRES_USERNAME|Postgres username|yes||||
|POSTGRES_PASSWORD|Postgres password|yes||||
|POSTGRES_DB|Postgres database|yes||||
|POSTGRES_HOST|Postgres host|yes||||
|POSTGRES_PORT|Postgres port|yes||||

# Prerequisites
Node v10+
PostgreSQL

# Running the application in containers
The application is designed to run as a container via Docker Compose or Kubernetes (with Helm). A helm chart is included in the `.\helm` folder.

A utility script is provided to aid in deploying to a local cluster.

First build the container so it is available in the local Docker registry

 `./scripts/build-image`
 
 Then deploy to the current Helm context

 `./scripts/deploy-local`

 A local Postgres database will need to be installed and setup with the username and password defined in the [values.yaml](./helm/values.yaml) for the service to operate.

It is much quicker to develop using docker compose locally than to set up a local environment.
The [./scripts/start](./scripts/start) script will run the migrations, start a nodemon session watching for changes in `.js` files, and attach to the running service. Logs will be tailed and the service may be brought down by pressing `Ctrl + C`.

The start script will also create the required `mine-support` network so that it can communicate with other Mine Support services running alongside it through docker-compose.

The `start` scripts uses two override files, [docker-compose.migrate.yaml](docker-compose.migrate.yaml) runs the migration, and [docker-compose.local.yaml](docker-compose.local.yaml) starts the service, mounting folders and setting up networking. Attempting to do this in a single script prevented the port mappings working.

For the volume mounts to work correct via WSL the application needs to be run from `/c/...` rather than `/mnt/c/..`.

You may need to create a directory at `/c` then mount it via `sudo mount --bind /mnt/c /c` to be able to change to `/c/..`

Alternatively automounting may be set up. Further details available [here](https://nickjanetakis.com/blog/setting-up-docker-for-windows-and-wsl-to-work-flawlessly).

# How to run tests
Tests are written in Lab and are intended to be run in an container.
The script used by the continuous integration build may be run via the script [./scripts/test](./scripts/test).

Tests may also be run locally but require a Postgres database for integration tests, and the following environment variables setting: `POSTGRES_USERNAME`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_HOST`

Local tests can be run with the command:

`npm run test`

# Build pipeline

The [azure-pipelines.yaml](azure-pipelines.yaml) performs the following tasks:
- Runs unit tests
- Publishes test result
- Pushes containers to the registry tagged with the PR number or release version
- Deletes PR deployments, containers, and namepace upon merge

Builds will be deployed into a namespace with the format `mine-support-user-service-{identifier}` where `{identifier}` is either the release version, the PR number, or the branch name.

A detailed description on the build pipeline and PR work flow is available in the [Defra Confluence page](https://eaflood.atlassian.net/wiki/spaces/FFCPD/pages/1281359920/Build+Pipeline+and+PR+Workflow)


# Testing locally

The mine-support-user-service is not exposed via an endpoint within Kubernetes.

The deployment may be accessed by forwarding a port from a pod.
First find the name of the pod by querying the namespace, i.e.

`kubectl get pods --namespace mine-support-user-service-pr2`

This will list the full name of all the pods in the namespace. Forward the pods exposed port 3002
to a local port using the name returned from the previous command, i.e.

`kubectl port-forward --namespace mine-support-user-service-pr2 mine-support-user-service-8b666f545-g477t  3002:3002`

Once the port is forwarded a tool such as [Postman](https://www.getpostman.com/) can be used to access the API at http://localhost:3002/register.
Sample valid JSON that can be posted is:
```
{ 
  "email": "test@email.com"
}
```
 Alternatively curl can be used locally to send a request to the end point, i.e.

```
curl  -i --header "Content-Type: application/json" --request POST --data '{ "email": "test@email.com" }' http://localhost:3002/register
```

# Testing 'In Situ'

A PR can also be tested by reconfiguring the mine-gateway service to use the URL of the PR rather than the current release in the development cluster. Create a `patch.yaml` file containing the desired URL:
```
apiVersion: extensions/v1beta1
kind: Deployment
spec:
  template:
    spec:
      containers:
      - env:
        - name: MINE_SUPPORT_USER_SERVICE
          value: http://mine-support-user-service.mine-support-user-service-pr2
        name: mine-support-api-gateway
```
then apply the patch:

`kubectl patch deployment --namespace default mine-support-api-gateway --patch "$(cat patch.yaml)"`

Once tested the patch can be rolled back, i.e.

`kubectl rollout undo --namespace default deployment/mine-support-api-gateway`
