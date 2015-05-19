var express = require('express');
var app = express();
var server = require('http').createServer(app);
var sockets = require('socket.io')(server);

var serviceGroups = require('./servicegroups');
var dataProvider;

app.use(express.static(__dirname + '/../public_html'));

// ==================================
// Message or error delivery to client
// ==================================
function sendUpdate(data) {
  console.log(new Date() + ': Sending update.');
  sockets.emit('update', data);
}

// get the resource or send an error message
function get(resource, callback, params) {
  dataProvider.getAll(resource, function(error, data) {
    if(error === null) {
      callback(data);
    } else {
      sockets.emit('error', error.message);
      console.log(new Date() + ': Error:' + error.message);
    }
  }, params);
}

// ==================================
// Data sources and scheduling
// ==================================
function addAndSendIncidents(statusPackage) {
  get('incidents', function(incidents) {
    serviceGroups.injectIncidents(statusPackage.groups, incidents);
    sendUpdate(statusPackage);
  }, {status: 'triggered,acknowledged'});
}

function sendServiceGroups() {
  get('services', function(services) {
    var groups = serviceGroups.packageStats(serviceGroups.group(services));
    if(groups.stats.problems > 0) {
      // need to get the details about the failing services
      addAndSendIncidents(groups);
    } else {
      sendUpdate(groups);
    }
  });
}

module.exports = function(provider, port) {
  dataProvider = provider;
  server.listen(port, function () {
    console.log('Server listening at port %d', port);
  });
  return {
    sendServiceGroups: sendServiceGroups
  };
};
