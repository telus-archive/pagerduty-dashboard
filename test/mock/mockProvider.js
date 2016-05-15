var services = require('./mockServices.json');

var resources = [];

function makeResources (resources, template) {
  var resourcesArray = [];
  Object.keys(resources).forEach(function (key, index) {
    var resource = {}; // create a fresh blank value
    // first copy all of the template values to the resource
    Object.keys(template).forEach(function (key, index) {
      resource[key] = template[key];
    });
    // next, copy all the values provided by the input
    var rawResource = resources[key];
    Object.keys(rawResource).forEach(function (key, index) {
      resource[key] = rawResource[key];
    });
    resourcesArray.push(resource);
  });

  return resourcesArray;
}

// generate the sample services using the following as a template
resources.services = makeResources(services.services, {
  'id': 'ABCDEFG',
  'name': 'Template',
  'service_url': '/services/ABCDEFG',
  'service_key': 'key@acme.pagerduty.com',
  'auto_resolve_timeout': 14400,
  'acknowledgement_timeout': 1800,
  'created_at': '2014-12-03T16:20:23-08:00',
  'deleted_at': null,
  'status': 'active',
  'last_incident_timestamp': '2015-04-02T07:50:24-07:00',
  'email_incident_creation': 'use_rules',
  'incident_counts': {
    'triggered': 0,
    'resolved': 32,
    'acknowledged': 0,
    'total': 32
  },
  'email_filter_mode': 'all-email',
  'type': 'generic_email',
  'description': '',
  'escalation_policy': {
    'id': 'BCDEFGH',
    'name': 'Some Policy'
  }
});

// dummy implementation of getAll (see real API getAll function)
function getAll (resource, callback, params) {
  try {
    // use JSON parse and stringify to avoid modifying the cache
    callback(null, JSON.parse(JSON.stringify(resources[resource])));
  } catch (e) {
    callback(null, {});
  }
}

module.exports = {
  getAll: getAll
};
