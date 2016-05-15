var request = require('request');

var subdomain;
var apiKey;

module.exports = function (domain, key) {
  subdomain = domain;
  apiKey = key;
  return {
    getAll: getAllResources
  };
};

// get all the items at the 'resource' endpoint
// note: the API limits the returned resources to 100, so multiple requests
//       may be needed which is why the inner functions are mutually recursive
function getAllResources (resource, callback, params) {
  var resources = [];
  params = params || {};

  // send off the API request with the proper parameters
  function getResources (offset, limit) {
    params.offset = offset;
    params.limit = limit;
    apiRequest(resource, processResources, params);
  }

  // handle the API response, either noting an error or saving the data
  function processResources (error, response, data) {
    if (error || !response) {
      callback(error, {});
    } else if (response.statusCode < 200 || response.statusCode >= 400) {
      var errorMessage = 'HTTP ' + response.statusCode;
      if (data.error && data.error.message) {
        errorMessage += ': ' + data.error.message;
      }
      callback(new Error(errorMessage), {});
    } else {
      accumulateResources(data);
    }
  }

  // save the data for return and either:
  // 1: send futher requests for the remaining data (because of the limit)
  // 2: send the data to the callback of the requester
  function accumulateResources (data) {
    resources = resources.concat(data[resource]);
    if (data.total > resources.length) {
      getResources(data.offset + data.limit, data.limit);
    } else {
      callback(null, resources);
    }
  }

  // kick off the requests with a 0 offset and the maximum limit
  getResources(0, 100);
}

// send an API request with the proper headers
function apiRequest (resource, callback, params) {
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
    } catch (e) {
      jsonBody = {};
    }
    callback(error, response, jsonBody);
  });
}
