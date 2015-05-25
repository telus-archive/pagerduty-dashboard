var _ = require('underscore');

/*
Get the group and service names from a service name
Current format: <groupName>: <serviceName>
*/
function groupRegexComponent(value, index) {
  var match = /(.*):(.*)/.exec(value);
  return (match && match[index]) ? match[index].trim() : value.trim();
}

function groupNameFromFullName(name) {
  return groupRegexComponent(name, 1);
}

function serviceNameFromFullName(name) {
  return groupRegexComponent(name, 2);
}

/*
A group is a core group when it has server and site services
*/
function isCoreGroup(group) {
  return group.services['Site'] && group.services['Server'];
}

function addServiceToGroup(service, groupName, groups) {
  if(!groups[groupName]) {
    groups[groupName] = {
      name: groupName,
      services: {}
    };
  }
  groups[groupName].services[serviceNameFromFullName(service.name)] = service;
}

/*
Status to number conversion - makes it easier to sort
*/
function statusToLevel(status) {
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

function statusLevelToType(level) {
  return level > 2 ? 'bad' : 'good';
}

/*
Process an array of PagerDuty services into groups
Also collects some stats

Returns:
A mapping (object) of group names to groups
Each group contains a mapping (object) of service names to services
*/
function sortServicesIntoGroups(services) {
  var groups = {};

  _.each(services, function (service) {
    addServiceToGroup(service, groupNameFromFullName(service.name), groups);
  });

  return groups;
}

function injectIncidentsIntoGroups(incidents, groups) {
  var service, serviceGroup, badGroups = groups.core.bad, otherGroup = groups.other;

  _.each(incidents, function(incident) {
    service = incident.service;
    serviceGroup = groupNameFromFullName(service.name);
    try {
      serviceGroup = badGroups[serviceGroup] || otherGroup;
      service = serviceGroup.services[serviceNameFromFullName(service.name)];
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

function processCoreGroup(group, coreGroups) {
  var maxLevel = 0, maxStatus = 'disabled', count = 0;
  _.each(group.services, function (service) {
    service.statusLevel = statusToLevel(service.status);
    service.name = serviceNameFromFullName(service.name);
    if(service.statusLevel > maxLevel) {
      maxLevel = service.statusLevel;
      maxStatus = service.status
    }
    count += 1;
  });
  group.statusLevel = maxLevel;
  group.status = maxStatus;
  group.featureCount = count;

  var statusType = statusLevelToType(group.statusLevel);
  coreGroups[statusType][group.name] = group;
  coreGroups[statusType + 'Count'] += 1;
}

function packageGroups(groups) {
  var coreGroups = {
    good: {},
    goodCount: 0,
    bad: {},
    badCount: 0
  },
  otherGroup = {
    good: {},
    goodCount: 0,
    bad: {},
    badCount: 0
  },
  stats = {
    problems: 0,
  };

  _.each(groups, function(group) {

    if(isCoreGroup(group)) {
      processCoreGroup(group, coreGroups);
    } else {
      // not a core group? merge its services into "Other"
      _.each(group.services, function(service) {
        service.statusLevel = statusToLevel(service.status);
        var statusType = statusLevelToType(service.statusLevel);
        otherGroup[statusType][service.name] = service;
        otherGroup[statusType + 'Count'] += 1;
      });
    }
  });

  return {
    coreGroups: coreGroups,
    otherGroup: otherGroup,
    stats: stats
  };
}



/*
Exports
*/
module.exports = {
  injectIncidentsIntoPackage: function(package) {
    injectIncidentsIntoGroups(package.groups);
  },
  packageServices: function(services) {
    return packageGroups(sortServicesIntoGroups(services));
  }
};
