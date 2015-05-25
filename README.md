PagerDuty Dashboard
=============================

[![Dependency Status](https://david-dm.org/gondek/pagerduty-dashboard.svg)](https://david-dm.org/gondek/pagerduty-dashboard)
[![devDependency Status](https://david-dm.org/gondek/pagerduty-dashboard/dev-status.svg)](https://david-dm.org/gondek/pagerduty-dashboard#info=devDependencies)

Grabs services from PagerDuty, groups them, and then highlights groups that are experiencing issues.

Currently a colon acts as a separator between the group name and individual service (eg. `<group>: <sevice>`). Then, groups that do not contain a `Site` and `Server` service get merged into a generic "other" group.

##Setup

1. Enter configuration (API) information in `config.json`
2. Install dependencies: `npm install`
3. Build the front-end/client: `grunt`
4. Start the back-end/server: `node app.js`

During development, running `grunt dev` will restart the server and run builds when files change.
