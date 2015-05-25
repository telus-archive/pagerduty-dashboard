var express = require('express');
var app = express();
var server = require('http').createServer(app);
var sockets = require('socket.io')(server);

var resources = require('./resources');
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

function updateStatus() {
  get('services', function(services) {
    var data = resources.packageServices(services);
    if(data.stats.problems > 0) {
      get('incidents', function(incidents) {
        resources.injectIncidentsIntoPackage(incidents, data);
        sendUpdate(data);
      }, {status: 'triggered,acknowledged'}); //only get these types of incidents
    } else {
      sendUpdate(data);
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
    updateStatus: updateStatus
  };
};
