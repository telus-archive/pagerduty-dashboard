var config = require('./config.json');

var dataProvider = (config.mock)
  ? require('./test/mock-provider')
  : require('./server/pagerduty')(config.apiSubdomain, config.apiKey);

var dashboard = require('./server/main')(dataProvider, config.serverPort);

setInterval(dashboard.sendServiceGroups, 1000 * config.updateInterval);
