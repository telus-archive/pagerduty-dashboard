var config = require('./config.json');

var dataProvider = config.mock ?
  require('./test/mock-provider') :
  require('./server/api')(config.apiSubdomain, config.apiKey);

var dashboard = require('./server/main')(
  dataProvider,
  config.apiSubdomain,
  config.serverPort);

setInterval(dashboard.updateStatus, 1000 * config.updateInterval);
