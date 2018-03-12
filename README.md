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
