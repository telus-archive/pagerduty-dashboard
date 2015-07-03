var express = require('express');
var app = express();
var server = require('http').createServer(app);
var sockets = require('socket.io')();
var hash = require('crypto').createHash;
var path = require('path');

var buildGroups = require('./groups');
var dataProvider;
var subdomain;
var dataPackageCache;

module.exports = function(provider, domain, port, base) {
  dataProvider = provider; //could be the API or the mock data
  subdomain = domain;

  base = base.replace(/\/$/, '');

  app.use(base, express.static(path.join(__dirname, '..', 'public_html')));
  sockets.path((base === '/' ? '' : base) + '/socket.io');
  sockets.attach(server);

  server.listen(port, function() {
    console.log('Server listening at port %d', port);
  });

  sockets.on('connection', function(socket) {
    if (dataPackageCache) {
      sendUpdate(dataPackageCache);
    }
  });

  return {
    updateStatus: updateStatus
  };
};

function updateStatus() {
  get('services', function(services) {
    dataPackageCache = makeUpdatePackage(services);
    console.log(new Date() + ': Sending update.');
    sendUpdate(dataPackageCache);
  });
}

function get(resource, callback, params) {
  dataProvider.getAll(resource, function(error, data) {
    if (error) {
      return sendError(error);
    }
    callback(data);
  }, params);
}

function makeUpdatePackage(services) {
  var groups = buildGroups(services);
  return {
    groups: groups,
    subdomain: subdomain,
    hash: hash('sha256').update(JSON.stringify(groups)).digest('hex')
  };
}

function sendUpdate(updatePackage) {
  sockets.emit('update', updatePackage);
}

function sendError(error) {
  console.log(new Date() + ': ' + error.message);
  sockets.emit('error', error.message);
}
