PagerDuty Dashboard
=============================

[![Dependency Status](https://david-dm.org/gondek/pagerduty-dashboard.svg)](https://david-dm.org/gondek/pagerduty-dashboard)

Grabs services from PagerDuty, groups them (currently a colon acts as a separator between the group name and individual service), and then highlights groups that are experiencing issues.

1. Enter configuration (API) information in `config.json`
2. Install dependencies: `npm install`
3. Build the front-end/client: `grunt`
4. Start the back-end/server: `node app.js`

During development, running `grunt dev` will restart the server and run builds when files change.
