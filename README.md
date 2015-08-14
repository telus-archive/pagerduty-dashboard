PagerDuty Dashboard
=============================

[![Dependency Status](https://david-dm.org/gondek/pagerduty-dashboard.svg)](https://david-dm.org/gondek/pagerduty-dashboard)
[![devDependency Status](https://david-dm.org/gondek/pagerduty-dashboard/dev-status.svg)](https://david-dm.org/gondek/pagerduty-dashboard#info=devDependencies)

[![PagerDuty Dashboard screenshot](/doc/screenshot.png?raw=true)](/doc/screenshot-full.png?raw=true)

Grabs services from [PagerDuty](http://www.pagerduty.com/), groups them, and then highlights issues.
For details on the grouping process, refer to the "Conventions" section below.

## Setup

1. Install [Node.js](https://nodejs.org/) and [Gulp](http://gulpjs.com/)
2. Run 'gulp configure' to create 'config.json', then enter your API and app information, and change `mock` to `false`.
3. Install dependencies: `npm install`
4. Build the front-end/client: `gulp`
5. Start the back-end/server: `node app.js`

You can then access the page at `localhost:<port>/<path>`

During development, running `gulp dev` will restart the server and/or run builds when files change. To use the sample data ([click here](/doc/screenshot-full.png?raw=true) for a preview), set `mock` to `true` in `config.json`.

For ease of deployment, you can pass parameters to the configuration task, which will insert changes into the existing `config.json` (or copy in the sample config if it doesn't exist):
`gulp configure --apiSubdomain yourCompany --apiKey abcdef --useMockData false`

## Custom View Configuration

To configure how the dashboard functions, click the gear icon in the bottom left corner. Then note down or bookmark the generated URL to have the settings you chose applied when you return.

## Conventions

These rules determine how the dashboard processes and displays data.

***[Click here](/doc/grouping-example.png?raw=true) for a screenshot with labels matching the descriptions below.***

### "Core" vs. "Other"

The services that should be separated into their own groups are "core" services. The rest are "other" services, which is the default state.

### Core Groups and Services

To add a service to a group, in the PagerDuty control panel:

1. Add `[dashboard-primary]` anywhere in the service's description.
2. Rename the service to use this convention: `<group>: <service>`. For example, if I wanted to put a "Server" service in the "Product Catalogue" group, I would name it "Product Catalogue: Server".

If a service has a name of `<group>: Site` or `<group>: Server`, it gets separated and enlarged. The two are meant to represent the overall/fundamental health of that group.

To add a group dependency, add `[dashboard-depends|list,of,dependencies]` to any service's description. Each comma-delimited entry can be a service name (`Some Service`) or a regular expression (`Caching Server (A|B|D)`). Dependencies of dependencies do not get added.

A core group's status is only determined from its services and not its dependencies.

### "Other" Groups and Services

If one or more of the remaining services are failing, the "other" group gets broken up into two pieces, one holding the offline/failing services and the other holding the online/okay services.

## Docker Image

Running the [`gondek/pagerduty-dashboard` docker image](https://registry.hub.docker.com/u/gondek/pagerduty-dashboard/) starts the dashboard with the mock data. For deployment, you will have to copy in your API information. You could use a Dockerfile like this (where `config.json` contains the API information):

```
FROM gondek/pagerduty-dashboard
ADD ./config.json /opt/pagerduty-dashboard/

# or use this
RUN gulp configure --apiSubdomain yourCompany --apiKey abcdef --useMockData false

```
## Testing

1. Follow the setup steps
2. Run `npm install -g protractor` to install [`protractor`](https://angular.github.io/protractor/) and `webdriver-manager`
3. Install/update Selenium: `webdriver-manager update`
4. Run Selenium: `webdriver-manager start`
5. Run the server with the port, path and mock settings from `config.sample.json`
6. Run `protractor test/protractor.js`
