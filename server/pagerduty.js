var request = require('request');

var subdomain;
var apiKey;

// ==================================
// Send and JSON-parse an API call
// ==================================
function apiRequest(resource, callback, params) {
  request({
    uri: 'https://' + subdomain + '.pagerduty.com/api/v1/' + resource,
    qs: params || {},
    headers: {
      'Authorization': 'Token token=' + apiKey
    }
  },
  function(error, response, body){
    var jsonBody;
    try {
      jsonBody = JSON.parse(body);
    } catch(e) {
      jsonBody = {};
    }
    callback(error, response, jsonBody);
  });
}

// ==================================
// Get All Resources
// ==================================
// The API limits the returned resources to 100, so multiple requests may be needed
// The inner functions are mutually recursive
function getAllResources(resource, callback, params) {
  var resources = [];
  params = params || {};

  function getResources(offset, limit) {
    params.offset = offset;
    params.limit = limit;
    apiRequest(resource, processResources, params);
  }

  function processResources(error, response, body) {
    if(null === error && response.statusCode >= 200 && response.statusCode < 400) {
      accumulateResources(body);
    } else {
      response = response || {statusCode: "???"};
      var errorMessage = 'HTTP ' + response.statusCode + ': ' + error;
      callback(new Error(errorMessage), {});
    }
  }

  function accumulateResources(body) {
    resources = resources.concat(body[resource]);
    if(body.total > resources.length) {
      // got to keep going and get the remaining resources
      getResources(body.offset + body.limit, body.limit);
    } else {
      // we have retrieved all the resources
      callback(null, resources);
    }
  }

  getResources(0, 100);
}

// ==================================
// Exports
// ==================================
module.exports = function(domain, key) {
  subdomain = domain;
  apiKey = key;
  return {
    getAll: getAllResources
  };
};
