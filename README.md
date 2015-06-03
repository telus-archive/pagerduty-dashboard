PagerDuty Dashboard
=============================

[![Dependency Status](https://david-dm.org/gondek/pagerduty-dashboard.svg)](https://david-dm.org/gondek/pagerduty-dashboard)
[![devDependency Status](https://david-dm.org/gondek/pagerduty-dashboard/dev-status.svg)](https://david-dm.org/gondek/pagerduty-dashboard#info=devDependencies)

Grabs services from [PagerDuty](http://www.pagerduty.com/), groups them, and then highlights issues.

## Setup

1. Install [Node.js](https://nodejs.org/) and [Gulp](http://gulpjs.com/)
2. Enter configuration information in `config.json` and set up your PagerDuty services as outlined in the `Conventions` below.
3. Install dependencies: `npm install`
4. Build the front-end/client: `gulp`
5. Start the back-end/server: `node app.js`

You can then access the page at `localhost:3000` (or at whatever port was configured).

During development, running `gulp dev` will restart the server and/or run builds when files change.

To load some sample data, add `"mock": true` to `config.json`.

## Custom View Configuration

To configure how the dashboard functions, go to `localhost:3000/#/customize` and note down the generated URL.

## Conventions

These rules determine how the dashboard processes and displays data.

### "Core" vs. "Other" Services

A service that contains `[dashboard-primary]` anywhere in its description is a core service. Core services get separated into core groups. The remaining services get put into the "Other" group.

### "Core" Groups

Core groups are generated from the core services. A colon acts as a separator between the group and service within the service name (eg. `<group>: <service>`). In the interface, these services are labeled as "features". Features with names of `<group>: Site` or `<group>: Server` get separated and enlarged.

Core groups can have dependencies, which are specified in their services. To specify a dependency, add `[dashboard-depends|Some Service,Dependency.*]` to the service's description. Each comma-delimited entry can be a service name (`Some Service`) or a regular expression (`Dependency.*`). Dependencies of dependencies do not get added (i.e. dependencies are only followed to a depth of 1). In the interface, these dependencies are labeled as "services".

A core group's status is only determined from its features (main services) and not its dependencies.

### "Other" Group

If one or more services within the other group are failing, the group gets broken up into two pieces, one holding the offline/failing services and the other holding the online/okay services.
