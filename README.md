# `fmi-crosscheck-tools`

This repository is a
[monorepo](https://medium.com/@maoberlehner/monorepos-in-the-wild-33c6eb246cb9).
It contains a number of different packages related to processing FMI cross-check
data.

There were two main reasons for making this a monorepo. The first was so that
issues related to different facets of these tools (UI, data handling, build
scripts), wouldn't be scattered among a bunch of different repositories. With a
monorepo, all issues can be tracked centrally in a single issue tracker.

Another reason was to keep things simple. Although keeping this more modular
would be a good practice to follow for a large scale system, these tools are
small enough and inherently integrated to the point where keeping them together
makes more sense.

## `data-types`

The [`data-types` directory](data-types/README.md) contains a collection of
common TypeScript type definitions that are shared by some of the other packages
stored in this repository. These definitions are published as the `npm`
package `@modelica/fmi-data`.

## `widgets`

The [`widgets` directory](widgets/README.md) contains a collection of
`react` components that are used to create an interactive experience when
browsing the FMI compliant tools described on the FMI web site. These
components are published as the `npm` package `@modelica/fmi-widgets`.

## `xc-scripts`

The [`xc-scripts` directory](xc-scripts/README.md) contains a collection of
scripts that read vendor supplied compliance data and process it into summary
compliance data to be rendered by the components in the `widgets` directory.
These scripts are publish as the `npm` package `@modelica/fmi-xc-scripts`.

## `build-server`

The [`build-server` directory](build-server/README.md) contains a collection of
_shell_ scripts that pull together code from all the various other packages in
order to generate the FMI web site. That process involves getting the latest
vendor supplied data, processing it, incorporating it into the FMI web site
Jekyll data, generating the web site and then publishing the results. Unlike
the other directories, the contents of the `build-server` directory is not
published as an `npm` package but is instead use to (automatically) build a
[Docker](https://www.docker.com/) image for a container capable of running this
workflow (either in a one-off mode or as a receiver of webhooks from GitHub).

# Deep Dive

Ultimately, all of what is contained in this repository is used to create a
build server that generates [the FMI web site](http://fmi-standard.org). Here
we will provide a bit more detail on how all the pieces fit together and run.

## What does the build server do?

The build server operates in two phases. The first is a setup phase that
happens exactly once when the build server starts up. In this phase, the most
recent versions of all the relevant repositories (vendors + web site) are `clone`d
locally on the server. They are persisted as long as the server is running.
These actions correspond to the `init.sh` script in `build-server`.

Once the server starts up, starts listening for `POST` requests on port `80`.
Any `POST` request to `http://build.fmi-standard.org/hooks/fmi-build` will
trigger a build. The build process involves invoking the `build.sh` scripts.
This script pulls the latest versions of all repositories (it is likely that at
least one has changed since their were `clone`d). Once we have all outstanding
commits pulled into our working directories, the `process_repo` scripts (from the
`xc-scripts` directory) is run across all vendor data to compile the processed
data. This data is then copied into the web site working directory in the
`_data` directory. When the web site is generated (using `jekyll`) the files in
the `_data` directory are copied to the static files associated with the web
site (stored in the `_site` directory). Finally, the generated files are pushed
to the CDN (currently `netlify`) which has the effect of updating the website at
`http://fmi-standard.org`.

## Can I use the Docker image to run the build locally?

> TODO: Fill this out, but figure out some way to utilize a local repo for the
> vendor data.

## How the build server image is created?

The Docker image of the build server is described by the
[`Dockerfile`](./build-server/Dockerfile) located in the `build-server`
directory. The Docker image itself is automatically build whenever this
repository is changed. The Docker image can be found on the web
[here](https://hub.docker.com/r/modelica/fmi-build-server/). The actual image
can be pulled down with the command `docker pull modelica/fmi-build-server`.

## Where is the build server running?

At the moment, the container running the image is hosted on [Digital
Ocean](http://digitalocean.com). But it is trivial to fire the server up on any
Docker host. For more details about configuring a Docker host and running the
build server on it, see the [deployment
documentation](./build-server/DEPLOYMENT.md).

Note that the DNS entry for the subdomain `build.fmi-standard.org` should point
to the IP address of the build server because all the vendor GitHub repositories
(as well as the FMI web site repository) all send a webhook to
`http://build.fmi-standard.orghooks/fmi-build` when changes are pushed to those
repositories (thus triggering a re-build).

## How are the vendor repositories processed?

The build server installs the latest published version of the
`@modelica/fmi-xc-scripts` package (contained in the `xc-scripts` directory) to
process the vendor data. The [`README`](./xc-scripts/README.md) file contains
details on how to use the scripts.
