PagerDuty Dashboard
=============================

[![Dependency Status](https://david-dm.org/gondek/pagerduty-dashboard.svg)](https://david-dm.org/gondek/pagerduty-dashboard)
[![devDependency Status](https://david-dm.org/gondek/pagerduty-dashboard/dev-status.svg)](https://david-dm.org/gondek/pagerduty-dashboard#info=devDependencies)

Grabs services from PagerDuty, groups them, and then highlights issues.

## Setup

1. Enter configuration (API) information in `config.json`
2. Install dependencies: `npm install`
3. Build the front-end/client: `grunt`
4. Start the back-end/server: `node app.js`

You can then access the page at `localhost:3000` (or at whatever port was configured).

During development, running `grunt dev` will restart the server and/or run builds when files change.

## Options

... the dashboard options wizard is coming soon ...

## Conventions

### "Core" vs. "Other" Services

Core services get separated into their own groups. The remaining services get put into the "Other" group. To indicate that a service belongs to a core group, add `[dashboard-primary]` anywhere in its description.

### "Core" Groups

Core groups are generated from the core service names. A colon acts as a separator between the group name and individual service (eg. `<group>: <service>`).

Core groups can have dependencies, which are specified in their services. To specific a dependency, add `[dashboard-depends|Dependency Service 1,Dependency Service 2]` to the service's description. Dependencies of dependencies do not get added (i.e. dependencies are only followed to a depth of 1).

Core groups have the following look:
- If a `Site` and/or `Server` service is present, both or one are shown separately in a larger format.
- The remaining services are listed in the normal format in several columns.
- The dependencies of the group are listed in the normal format in one column.

### "Other" Group

If one or more services within the other group are failing, the group gets broken up into two pieces, one holding the offline/failing services and the other holding the online/okay services.

Services are listed in the normal format in several columns.

### Data Processing

The original properties of the services remain unchanged throughout their processing (so this can be used as an invariant). However, new attributes do get added server-side which get used client-side, like `properName`.

In general, as much processing/calculation as possible gets done server-side.
