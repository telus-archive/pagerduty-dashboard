var request = require('request');

var subdomain;
var apiKey;

/*
Send and JSON-parse an API call
*/
function apiRequest(resource, callback, params) {
  request({
    uri: 'https://' + subdomain + '.pagerduty.com/api/v1/' + resource,
    qs: params || {},
    headers: {
      'Authorization': 'Token token=' + apiKey
    }
  }, function (error, response, body) {
    var jsonBody;
    try {
      jsonBody = JSON.parse(body);
    } catch(e) {
      jsonBody = {};
    }
    callback(error, response, jsonBody);
  });
}

/*
Get all of a certain resource

The API limits the returned resources to 100, so multiple requests may be needed
getAllResources's inner functions are mutually recursive
*/
function getAllResources(resource, callback, params) {
  var resources = [];
  params = params || {};

  function getResources(offset, limit) {
    params.offset = offset;
    params.limit = limit;
    apiRequest(resource, processResources, params);
  }

  function processResources(error, response, data) {
    if(error || !response) {
      callback(error, {});
    } else if (response.statusCode < 200 || response.statusCode >= 400) {
      var errorMessage = 'HTTP ' + response.statusCode;
      if(data.error && data.error.message) {
        errorMessage += ': ' + data.error.message;
      }
      callback(new Error(errorMessage), {});
    } else {
      accumulateResources(data);
    }
  }

  function accumulateResources(data) {
    resources = resources.concat(data[resource]);
    if(data.total > resources.length) {
      // got to keep going and get the remaining resources
      getResources(body.offset + data.limit, data.limit);
    } else {
      // we have retrieved all the resources
      callback(null, resources);
    }
  }

  // start off the resource gathering process
  getResources(0, 100);
}

/*
Require a domain and key to give access to the API
*/
module.exports = function(domain, key) {
  subdomain = domain;
  apiKey = key;
  return {
    getAll: getAllResources
  };
};
