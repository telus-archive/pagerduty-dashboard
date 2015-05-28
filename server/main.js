var express = require('express');
var app = express();
var server = require('http').createServer(app);
var sockets = require('socket.io')(server);

var services = require('./services');
var dataProvider;

app.use(express.static(__dirname + '/../public_html'));

module.exports = function(provider, port) {
  dataProvider = provider; //could be the API or the mock data
  server.listen(port, function () {
    console.log('Server listening at port %d', port);
  });
  return {
    updateStatus: updateStatus
  };
};

function updateStatus() {
  get('services', function(apiServices) {
    var data = services.processServices(apiServices);
    if(data.problems) {
      get('incidents', function(incidents) {
        data.addIncidents(incidents);
        sendUpdate(data.package());
      }, {status: 'triggered,acknowledged'}); //only get these incidents
    } else {
      sendUpdate(data.package());
    }
  });
}

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

function sendUpdate(data) {
  console.log(new Date() + ': Sending update.');
  sockets.emit('update', data);
}
