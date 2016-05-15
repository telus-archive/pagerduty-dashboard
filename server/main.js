var config = require('./config.json');

// should we use the mock data provider or try using the API?
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
  config.basePath
);

// do the initial group and service update, and then schedule further ones
dashboard.updateStatus();
setInterval(dashboard.updateStatus, 1000 * config.updateInterval);
