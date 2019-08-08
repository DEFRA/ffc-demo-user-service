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

- Node v10+
- Access to a PostgreSQL database

# How to run tests
A convenience script is provided to run automated tests in a containerised environment:

```
scripts/test
```

Alternatively, the same tests may be run locally via npm:

```
npm run test
```

Running the tests locally requires a Postgres database for integration tests, and the following environment variables:

- `POSTGRES_USERNAME`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `POSTGRES_HOST`

# Running the application
The application is designed to run as a container via Docker Compose or Kubernetes (with Helm).

## Using Docker Compose
A set of convenience scripts are provided for local development and running via Docker Compose.

```
# Build service containers
scripts/setup

# Start the service and attach to running containers (press `ctrl + c` to quit)
scripts/start

# Stop the service and remove Docker volumes and networks created by the start script
scripts/stop
```

Any arguments given to the start script are passed through to the `docker-compose up` command. For example, this allows the service to be started without attaching to containers:

```
# Start the service without attaching to containers
scripts/start --detach
```

The script [wait-for](./wait-for) is used to ensure the Postgres database is accepting connections before running the migration. Further details on `wait-for` are available [here](https://github.com/gesellix/wait-for).

This service depends on an external Docker network named `mine-support` to communicate with other Mine Support services running alongside it. The start script will automatically create the network if it doesn't exist and the stop script will remove the network if no other containers are using it.

### Volume mounts on Windows Subsystem for Linux
For the volume mounts to work correct via WSL the application needs to be run from `/c/...` rather than `/mnt/c/..`.

You may need to create a directory at `/c` then mount it via `sudo mount --bind /mnt/c /c` to be able to change to `/c/..`

Alternatively automounting may be set up. Further details available [here](https://nickjanetakis.com/blog/setting-up-docker-for-windows-and-wsl-to-work-flawlessly).

## Using Kubernetes
The service has been developed with the intention of running on Kubernetes in production.  A helm chart is included in the `.\helm` folder.

Running via Helm requires a local Postgres database to be installed and setup with the username and password defined in the [values.yaml](./helm/values.yaml). It is much simpler to develop using Docker Compose locally than to set up a local Kubernetes environment. See above for instructions.

To test Helm deployments locally, a [deploy](./deploy) script is provided.

```
# Build service containers
scripts/setup

# Deploy to the current Helm context
scripts/deploy
```

### Accessing the pod
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

# Build pipeline

The [azure-pipelines.yaml](azure-pipelines.yaml) performs the following tasks:
- Runs unit tests
- Publishes test result
- Pushes containers to the registry tagged with the PR number or release version
- Deletes PR deployments, containers, and namepace upon merge

Builds will be deployed into a namespace with the format `mine-support-user-service-{identifier}` where `{identifier}` is either the release version, the PR number, or the branch name.

A detailed description on the build pipeline and PR work flow is available in the [Defra Confluence page](https://eaflood.atlassian.net/wiki/spaces/FFCPD/pages/1281359920/Build+Pipeline+and+PR+Workflow)

## Testing a pull request

A PR can be tested by reconfiguring the mine-gateway service to use the URL of the PR rather than the current release in the development cluster. Create a `patch.yaml` file containing the desired URL:

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
