var express = require('express');
var app = express();
var server = require('http').createServer(app);
var sockets = require('socket.io')();
var hash = require('crypto').createHash;
var path = require('path');

var buildGroups = require('./groups');
var dataProvider;
var subdomain;

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

  return {
    updateStatus: updateStatus
  };
};

function updateStatus() {
  get('services', function(services) {
    sendUpdate(buildGroups(services));
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

function sendUpdate(data) {
  console.log(new Date() + ': Sending update.');
  sockets.emit('update', {
    groups: data,
    subdomain: subdomain,
    hash: hash('sha256').update(JSON.stringify(data)).digest('hex')
  });
}

function sendError(error) {
  console.log(new Date() + ': ' + error.message);
  sockets.emit('error', error.message);
}
