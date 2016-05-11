var config = require('./config.json');

function useMockData () {
  return config.useMockData || !(config.apiSubdomain && config.apiKey);
}

var dataProvider = useMockData()
  ? require('../test/mock/mockProvider')
  : require('./services/api')(config.apiSubdomain, config.apiKey);

var dashboard = require('./services/server')(
  dataProvider,
  config.apiSubdomain,
  config.serverPort,
  config.basePath);

dashboard.updateStatus();
setInterval(dashboard.updateStatus, 1000 * config.updateInterval);
