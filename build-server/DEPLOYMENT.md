## Running the Server

I deployed this on Digital Ocean with a pretty trivial set of commands:

```sh
$ docker-machine create --driver digitalocean --digitalocean-size s-1vcpu-1gb --digitalocean-access-token=$DO_TOKEN cross-check
$ eval $(docker-machine env cross-check)
```

That creates a Docker host.  Then to actually start the server on that host you need to run the command:

```sh
$ docker run -d -p 80:9000 --restart always -e NETLIFY_TOKEN=... --name xc modelica/fmi-build-server
```

## Monitoring the Server

To see what is going on with the machine during builds, just run:

```sh
$ eval $(docker-machine env cross-check)
$ docker logs xc
```
To continuously monitor activity, do `docker logs -f xc` instead.

## Updating the Server

First, you need to commit your changes to the `modelica/fmi-crosscheck-tools` repository (specifically in the `build-server`
directory.  At that point, the [`modelica/fmi-build-server` image](https://hub.docker.com/r/modelica/fmi-build-server/)
should be rebuilt (see [build status](https://hub.docker.com/r/modelica/fmi-build-server/builds/)).

If you have a running server, you need to first configure Docker to talk to the host with
`eval $(docker-machine env cross-check)` (or whatever the name of the Docker machine configuration is).

Once the automatic build has completed and you are configured to interact with the docker host.  Then you just need
to run these four commands:

```sh
$ docker stop xc   # Stop existing container
$ docker rm xc     # Remove existing container
$ docker pull modelica/fmi-build-server   # Grab latest image
$ docker run -d -p 80:9000 --restart always -e NETLIFY_TOKEN=... --name xc modelica/fmi-build-server
```

## Triggering Builds

Once a Docker image is running on a publically accessible machine, the only
thing required in order to trigger a build on a "push" to a vendor repository is
to add a "webhook" to that repository. The webhook configuration is under
"Settings". Just navigate to the "Webhooks" section and press the "Add webhook"
button. The only required step is to fill in the "Payload URL" field with a URL
of the form:

```
http://<IP ADDRESS OF SERVER>:9000/hooks/fmi-build
```
