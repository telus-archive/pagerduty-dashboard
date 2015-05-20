/*
Rename a service (remove the group from the title)
Inject the group name as a property
*/
function groupService(service) {
  var names;

  // Currently we assume a colon separates the group and service
  names = /(.*):(.*)/.exec(service.name);
  if(null === names) {
    // Otherwise, the service has/is its own group
    service.group = service.name;
  } else {
    service.name = names[2].trim();
    service.group = names[1].trim();
  }
}

/*
Process an array of PagerDuty services into groups

Returns:
A mapping (object) of group names to groups
Each group contains a mapping (object) of service names to services
*/
function groupServices(services) {
  var groups = {};

  services.forEach(function(service) {
    groupService(service);
    if(undefined === groups[service.group]) {
      // new group has been identified; create it
      groups[service.group] = {
        name: service.group,
        services: {}
      };
    }
    // add the service to its group
    groups[service.group].services[service.name] = service;
  });

  return groups;
}

/*
Status to number conversion - makes it easier to sort
*/
function statusToPriority(status) {
  switch(status) {
    case 'critical':
      return 4;
    case 'warning':
      return 3;
    case 'active':
      return 2;
    case 'maintenance':
      return 1;
    case 'disabled':
      return 0;
  }
}

/*
Determine a group's overall status and collect statistics while doing so

The numeric priority is used for sorting/comparison
The string status is used client-side for styling
*/
function setStatus(group, stats) {
  // start out assuming the lowest possible group status
  var groupStatus = 'disabled', groupPriority = 0, service, servicePriority;

  Object.keys(group.services).forEach(function(name) {
    // current service and status number
    service = group.services[name];
    servicePriority = statusToPriority(service.status);

    // add to the service status stats
    stats.services[service.status] += 1;

    // add the priority attribute for easy sorting client side
    service.statusPriority = servicePriority;

    // should the current service's status determine the group's status?
    if(servicePriority > groupPriority) {
      groupStatus = service.status;
      groupPriority = servicePriority;
    }
  });

  // inject the status info into the group
  group.status = groupStatus;
  group.statusPriority = groupPriority;

  // add to the group status stats
  stats.groups[groupStatus] += 1;
}

/*
Determine group statuses and gather stats
*/
function packageStats(groups) {
  var stats = {
    problems: 0,
    groups: {
      critical: 0,
      warning: 0,
      active: 0,
      maintenance:0,
      disabled: 0
    },
    services: {
      critical: 0,
      warning: 0,
      active: 0,
      maintenance: 0,
      disabled: 0
    }
  };

  Object.keys(groups).forEach(function(name) {
    setStatus(groups[name], stats);
  });

  // provide a quick way to check if there are issues
  stats.problems = stats.groups.critical + stats.groups.warning;

  return {stats: stats, groups: groups};
}

/*
Adds incidents to services

groups: groupServices object format
incidents: array from PagerDuty
*/
function injectIncidents(groups, incidents) {
  var service;

  incidents.forEach(function(incident) {
    service = incident.service;
    groupService(service);
    try {
      // the first line here can cause an issue
      service = groups[service.group].services[service.name];
      if(service.incidents === undefined) {
        service.incidents = [];
      }
      service.incidents.push(incident);
    } catch(error) {
      // there is a small chance a service was added in between the time
      // the services were fetched and the incidents were fetched
    }
  });
}

/*
Exports
*/
module.exports = {
  group: groupServices,
  packageStats: packageStats,
  injectIncidents: injectIncidents
};
