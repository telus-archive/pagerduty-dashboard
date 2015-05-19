var config = require('./config.json');
var dashboard = require('./server/main')(
  config.mock ?
  require('./test/mock-provider') :
  require('./server/pagerduty')(config.apiSubdomain, config.apiKey),
  config.serverPort
);

setInterval(dashboard.sendServiceGroups, 1000 * config.updateInterval);
