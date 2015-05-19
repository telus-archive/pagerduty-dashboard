// ==================================
// Group services by Brand/Product
// ==================================

// rename the service based on a group and inject the group name
function groupService(service) {
  var names;

  // Currently we assume a colon separates the group and service
  names = /(.*):(.*)/.exec(service.name);
  if(null === names) {
    // Otherwise, the service has its own group
    service.group = service.name;
  } else {
    service.name = names[2].trim();
    service.group = names[1].trim();
  }
}

// processes an array of pagerduty services into groups
// groups is a mapping of group names to groups
// each group contains a mapping of service names to services
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
    groups[service.group].services[service.name] = service;
  });

  return groups;
}

// ==================================
// Status Injection
// ==================================

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

// determine a group's overall status and collect statistics while doing so
function setStatus(group, stats) {
  var groupStatus = 'disabled', groupPriority = 0, service, servicePriority;

  Object.keys(group.services).forEach(function(name) {
    // current service in iteration
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

// determine group statuses and gather stats
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

  stats.problems = stats.groups.critical + stats.groups.warning;

  return {stats: stats, groups: groups};
}

// ==================================
// Incident Injection
// ==================================

function injectIncidents(groups, incidents) {
  var service;

  incidents.forEach(function(incident) {
    service = incident.service;
    groupService(service);
    service = groups[service.group].services[service.name];
    if(service.incidents === undefined) {
      service.incidents = [];
    }
    service.incidents.push(incident);
  });
}

// ==================================
// Exports
// ==================================
module.exports = {
  group: groupServices,
  packageStats: packageStats,
  injectIncidents: injectIncidents
};
