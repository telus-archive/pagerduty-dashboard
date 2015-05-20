var express = require('express');
var app = express();
var server = require('http').createServer(app);
var sockets = require('socket.io')(server);

var serviceGroups = require('./servicegroups');
var dataProvider;

app.use(express.static(__dirname + '/../public_html'));

/*
Message the client
*/
function sendUpdate(data) {
  console.log(new Date() + ': Sending update.');
  sockets.emit('update', data);
}

/*
Get the resource or send an error message
*/
function get(resource, callback, params) {
  dataProvider.getAll(resource, function(error, data) {
    if(error === null) {
      callback(data);
    } else {
      sockets.emit('error', error.message);
      console.log(new Date() + ': ' + error.message);
    }
  }, params);
}

/*
Collect incidents and add them to the data package
*/
function addAndSendIncidents(statusPackage) {
  get('incidents', function(incidents) {
    // merge the incidents into the services in our groups
    serviceGroups.injectIncidents(statusPackage.groups, incidents);
    sendUpdate(statusPackage);
  }, {status: 'triggered,acknowledged'}); //only get these types of incidents
}

/*
Collect the services, group them, and gather stats
*/
function sendServiceGroups() {
  get('services', function(services) {
    var statusPackage = serviceGroups.packageStats(serviceGroups.group(services));
    if(statusPackage.stats.problems > 0) {
      // need to get the details about the failing services
      addAndSendIncidents(statusPackage);
    } else {
      sendUpdate(statusPackage);
    }
  });
}

/*
Require a port and a data provider (API or mock) to start the app
*/
module.exports = function(provider, port) {
  dataProvider = provider;
  server.listen(port, function () {
    console.log('Server listening at port %d', port);
  });
  return {
    sendServiceGroups: sendServiceGroups
  };
};
