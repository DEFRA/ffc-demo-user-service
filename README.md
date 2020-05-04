[![Known Vulnerabilities](https://snyk.io/test/github/DEFRA/ffc-demo-user-service/badge.svg?targetFile=package.json)](https://snyk.io/test/github/DEFRA/ffc-demo-user-service?targetFile=package.json)

# FFC Demo User Service

N.B. This repo has now been archived as its functionality now exists in other services

Digital service mock to claim public money in the event property subsides into mine shaft.  The user service receives user data and if it doesn’t already exist saves it in a Postgresql database table.

## Prerequisites

Either:
- Docker
- Docker Compose

Or:
- Kubernetes
- Helm

Or:
- Node 10
- PostgreSQL database

## Environment variables

The following environment variables are required by the application container. Values for development are set in the Docker Compose configuration. Default values for production-like deployments are set in the Helm chart and may be overridden by build and release pipelines.

| Name              | Description       | Required | Default     | Valid                     | Notes |
|-------------------|-------------------|:--------:|-------------|---------------------------|-------|
| NODE_ENV          | Node environment  | no       | development |development,test,production|       |
| PORT              | Port number       | no       | 3002        |                           |       |
| POSTGRES_USERNAME | Postgres username | yes      |             |                           |       |
| POSTGRES_PASSWORD | Postgres password | yes      |             |                           |       |
| POSTGRES_DB       | Postgres database | yes      |             |                           |       |
| POSTGRES_HOST     | Postgres host     | yes      |             |                           |       |
| POSTGRES_PORT     | Postgres port     | yes      |             |                           |       |

## Building the project locally

To build the project locally the Docker client must be authenticated against the private Defra container registry to retrieve the parent image.
An ECR registry provides exact commands for authenticating the Docker client.
These can be found by selecting a repository and clicking the `View push commands` button.

The environment variable `DOCKER_REGISTRY` must be set to the registry holding the Defra parent image,
i.e.
```
export DOCKER_REGISTRY=registryid.myprivatedockersite.com
```

## How to run tests

A convenience script is provided to run automated tests in a containerised environment. The first time this is run, container images required for testing will be automatically built. An optional `--build` (or `-b`) flag may be used to rebuild these images in future (for example, to apply dependency updates).

```
# Run tests
scripts/test

# Rebuild images and run tests
scripts/test --build
```

This runs tests via a `docker-compose run` command. If tests complete successfully, all containers, networks and volumes are cleaned up before the script exits. If there is an error or any tests fail, the associated Docker resources will be left available for inspection.

Alternatively, the same tests may be run locally via npm:

```
# Run tests without Docker
npm run test
```

Running the tests locally requires a Postgres database for integration tests, and the following environment variables:

- `POSTGRES_USERNAME`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `POSTGRES_HOST`

## Running the application

The application is designed to run in containerised environments, using Docker Compose in development and Kubernetes in production.

- A Helm chart is provided for production deployments to Kubernetes.

### Build container image

Container images are built using Docker Compose, with the same images used to run the service with either Docker Compose or Kubernetes.

By default, the start script will build (or rebuild) images so there will rarely be a need to build images manually. However, this can be achieved through the Docker Compose [build](https://docs.docker.com/compose/reference/build/) command:

```
# Build container images
docker-compose build
```

### Start and stop the service

Use Docker Compose to run service locally.

`docker-compose up`

Additional Docker Compose files are provided for scenarios such as linking to other running services.

Link to other services:
```
docker-compose -f docker-compose.yaml -f docker-compose.link.yaml up
```

### Test the service

The service binds to a port on the host machine so it can be tested manually by sending HTTP requests to the bound port using a tool such as [Postman](https://www.getpostman.com) or `curl`.

```
# Send a sample request to the /register endpoint
curl -i --header "Content-Type: application/json" --request POST --data '{ "email": "test@email.com" }' http://localhost:3002/register
```

Sample valid JSON for the `/register` endpoint is:

```
{
  "email": "test@email.com"
}
```


### Link to sibling services

To test interactions with sibling services in the FFC demo application, it is necessary to connect each service to an external Docker network, along with shared dependencies such as message queues. The most convenient approach for this is to start the entire application stack from the [`ffc-demo-development`](https://github.com/DEFRA/ffc-demo-development) repository.

It is also possible to run a limited subset of the application stack. See the [`ffc-demo-development`](https://github.com/DEFRA/ffc-demo-development) Readme for instructions.

### Deploy to Kubernetes

For production deployments, a helm chart is included in the `./helm/ffc-demo-user-service` folder. This service connects to an AMQP 1.0 message broker, using credentials defined in [values.yaml](./helm/ffc-demo-user-service/values.yaml), which must be made available prior to deployment.

Scripts are provided to test the Helm chart by deploying the service, along with an appropriate message broker, into the current Helm/Kubernetes context.

```
# Deploy to current Kubernetes context
scripts/helm/install

# Remove from current Kubernetes context
scripts/helm/delete
```

#### Accessing the pod

By default, the service is not exposed via an endpoint within Kubernetes.

Access may be granted by forwarding a local port to the deployed pod:

```
# Forward local port to the Kubernetes deployment
kubectl port-forward --namespace=ffc-demo deployment/ffc-demo-user-service 3002:3002
```

Once the port is forwarded, the service can be accessed and tested in the same way as described in the "Test the service" section above.

## Dependency management

Dependencies should be managed within a container using the development image for the app. This will ensure that any packages with environment-specific variants are installed with the correct variant for the contained environment, rather than the host system which may differ between development and production.

The [`exec`](./scripts/exec) script is provided to run arbitrary commands, such as npm, in a running service container. If the service is not running when this script is called, it will be started for the duration of the command and then removed.

Since dependencies are installed into the container image, a full build should always be run immediately after any dependency change.

In development, the `node_modules` folder is mounted to a named volume. This volume must be removed in order for dependency changes to propagate from the rebuilt image into future instances of the app container. The [`start`](./scripts/start) script has a `--clean` (or `-c`) option  which will achieve this.

The following example will update all npm dependencies, rebuild the container image and replace running containers and volumes:

```
# Run the NPM update
scripts/exec npm update

# Rebuild and restart the service
scripts/start --clean
```

## Database migrations

Running the npm script

```
npm run migrate
```

Will run all the migration scripts to bring the database up to date. This script is run as part of the test suite, in order to create the database tables that are required for the tests to run.

The migrate script uses the `sequelize-cli` module to run any update scripts that are outstanding. `sequelize` uses the `umzug` module internally. The `dbversion` code uses this module to see if any migrations are outstanding when the service starts. The readiness probe also uses the `dbversion` code to check if the latest database migration is known to it. If it is not (if for example another version has performed database updates) then the readiness monitor will return an error, so that traffic is not routed to this instance.

This check is not run before every call deliberately. This would pose a performance issue. If the service was performing hundreds of requests per second, checking before every request would impose a penalty for very little gain. It would also be pointless, as errors should be dealt with properly at the time they occur, rather than trying to anticipate every one. There is also a race condition here, as even if the check was done before a request was handled it doesn't guarantee that the database would still be in the same state when the request completes.

### Database migrations under kubernetes

```
TBC - Currently database migrations are only done as part of the PR and are not done during any part of the kubernetes initialisation.
```

## Build pipeline

The [azure-pipelines.yaml](azure-pipelines.yaml) performs the following tasks:
- Runs unit tests
- Publishes test result
- Pushes containers to the registry tagged with the PR number or release version
- Deletes PR deployments, containers, and namepace upon merge

Builds will be deployed into a namespace with the format `ffc-demo-user-service-{identifier}` where `{identifier}` is either the release version, the PR number, or the branch name.

A detailed description on the build pipeline and PR work flow is available in the [Defra Confluence page](https://eaflood.atlassian.net/wiki/spaces/FFCPD/pages/1281359920/Build+Pipeline+and+PR+Workflow)

### Testing a pull request

A PR can be tested by reconfiguring the user service to use the URL of the PR rather than the current release in the development cluster. Create a `patch.yaml` file containing the desired URL:

```
apiVersion: extensions/v1beta1
kind: Deployment
spec:
  template:
    spec:
      containers:
      - env:
        - name: FFC_DEMO_USER_SERVICE
          value: http://ffc-demo-user-service.ffc-demo-user-service-pr2
        name: ffc-demo-user-service
```

then apply the patch:

`kubectl patch deployment --namespace default ffc-demo-user-service --patch "$(cat patch.yaml)"`

Once tested the patch can be rolled back, i.e.

`kubectl rollout undo --namespace default deployment/ffc-demo-user-service`

## License

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the license

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable information providers in the public sector to license the use and re-use of their information under a common open licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
