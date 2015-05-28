var services = require('./mock-services.json');
var incidents = require('./mock-incidents.json');
var _ = require('underscore');

function makeServices() {
  var currService, servicesArray = [];
  // in case we want to access additional fields
  var SERVICE_TEMPLATE = {
    "id": "ABCDEFG",
    "name": "Template",
    "service_url": "/services/ABCDEFG",
    "service_key": "key@acme.pagerduty.com",
    "auto_resolve_timeout": 14400,
    "acknowledgement_timeout": 1800,
    "created_at": "2014-12-03T16:20:23-08:00",
    "deleted_at": null,
    "status": "active",
    "last_incident_timestamp": "2015-04-02T07:50:24-07:00",
    "email_incident_creation": "use_rules",
    "incident_counts": {
      "triggered": 0,
      "resolved": 32,
      "acknowledged": 0,
      "total": 32
    },
    "email_filter_mode": "all-email",
    "type": "generic_email",
    "description": "",
    "escalation_policy": {
      "id": "BCDEFGH",
      "name": "Some Policy"
    }
  };

  services.services.forEach(function(service) {
    currService = JSON.parse(JSON.stringify(SERVICE_TEMPLATE));
    _.extend(currService, service);
    servicesArray.push(currService);
  });

  return servicesArray;
}

function makeIncidents() {
  var currIncident, incidentArray = [];
  // in case we want to access additional fields
  var INCIDENT_TEMPLATE = {
    "id": "ABCDEFG",
    "incident_number": 1000,
    "created_on": "2015-04-19T19:08:39Z",
    "status": "acknowledged",
    "pending_actions": [],
    "html_url": "https://acme.pagerduty.com/incidents/ABCDEFG",
    "incident_key": "- key name",
    "service": {},
    "escalation_policy": {
      "id": "BCDEFGH",
      "name": "Some Policy",
      "deleted_at": null
    },
    "assigned_to_user": null,
    "trigger_summary_data": {},
    "trigger_details_html_url": "https://acme.pagerduty.com/incidents/ABCDEFG/log_entries/Q2V3",
    "trigger_type": "email_trigger",
    "last_status_change_on": "2015-04-19T19:29:30Z",
    "last_status_change_by": null,
    "number_of_escalations": 1,
    "resolved_by_user": null,
    "assigned_to": [{
      "at": "2015-04-19T08:00:00Z",
      "object": {
        "id": "PERSON001",
        "name": "John Doe",
        "email": "j.doe@acme.com",
        "html_url": "https://acme.pagerduty.com/users/PERSON001",
        "type": "user"
      }
    }]
  };

  incidents.incidents.forEach(function(incident) {
    currIncident = JSON.parse(JSON.stringify(INCIDENT_TEMPLATE));
    _.extend(currIncident, incident);
    incidentArray.push(currIncident);
  });

  return incidentArray;
}

var resources = {
  services: makeServices,
  incidents: makeIncidents
};

function getAll(resource, callback, params) {
  try {
    callback(null, resources[resource]());
  } catch(e) {
    callback(null, {});
  }
}

module.exports = {
  getAll: getAll
};
