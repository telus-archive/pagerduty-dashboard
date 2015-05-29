PagerDuty Dashboard
=============================

[![Dependency Status](https://david-dm.org/gondek/pagerduty-dashboard.svg)](https://david-dm.org/gondek/pagerduty-dashboard)
[![devDependency Status](https://david-dm.org/gondek/pagerduty-dashboard/dev-status.svg)](https://david-dm.org/gondek/pagerduty-dashboard#info=devDependencies)

Grabs services from PagerDuty, groups them, and then highlights issues.

## Setup

1. Install [Node.js](https://nodejs.org/)
2. Enter configuration information in `config.json`
3. Install dependencies: `npm install`
4. Build the front-end/client: `grunt`
5. Start the back-end/server: `node app.js`

You can then access the page at `localhost:3000` (or at whatever port was configured).

During development, running `grunt dev` will restart the server and/or run builds when files change.

To load some sample data, add `"mock": true` to `config.json`.

## Custom View Wizard

... the dashboard custom view wizard is coming soon ...

## Conventions

### "Core" vs. "Other" Services

Core services get separated into their own groups. The remaining services get put into the "Other" group. To indicate that a service belongs to a core group, add `[dashboard-primary]` anywhere in its description.

### "Core" Groups

Core groups are generated from the core service names. A colon acts as a separator between the group name and individual service (eg. `<group>: <service>`). These core services are called "features".

Core groups can have dependencies, which are specified in their services. To specific a dependency, add `[dashboard-depends|Some Service,Dependency.*]` to the service's description. Each comma-delimited entry can be a service name (`Some Service`) or a regular expression (`Dependency.*`). Dependencies of dependencies do not get added (i.e. dependencies are only followed to a depth of 1). In the interface, these dependencies are labeled as "services".

A core group's status is only determined from its features (main services) and not its dependencies.

### "Other" Group

If one or more services within the other group are failing, the group gets broken up into two pieces, one holding the offline/failing services and the other holding the online/okay services.

### Data Processing

The original properties of the services remain unchanged throughout their processing (so this can be used as an invariant). However, new attributes do get added server-side which get used client-side, like `properName`.
