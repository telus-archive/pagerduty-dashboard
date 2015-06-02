var _ = require('underscore');

/*
Exports and processing workflow
*/

module.exports = function(rawServices) {
  return _.each(buildGroups(buildServices(rawServices)), processGroup);
};

/*
Service Processing
*/

function buildServices(rawServices) {
  var services = {};
  rawServices.forEach(function(rawService) {
    services[rawService.name] = buildService(rawService);
  });
  _.each(services, function(service) {
    parseServiceDependencies(service, services);
  });
  return services;
}

function buildService(rawService) {
  var service = {
    statusNumber: statusToNumber(rawService.status),
    properName: getServiceName(rawService),
    groupName: getServiceGroupName(rawService),
    isOnline: isOnline(rawService)
  };
  return _.extend(service, rawService);
}

function parseServiceDependencies(service, services) {
  service.dependencies = {};

  var dependencyNames = /\[dashboard-depends\|(.*)]/.exec(service.description);
  if (dependencyNames) {
    _.each(dependencyNames[1].split(','), function(dependencyName) {
      dependencyName = dependencyName.trim();
      addDependencyToService(dependencyName, service, services);
    });
  }

  service.dependencies = _.toArray(service.dependencies);
}

function addDependencyToService(dependencyName, service, services) {
  if (services[dependencyName]) {
    service.dependencies[dependencyName] = services[dependencyName];
  } else {
    try {
      var pattern = new RegExp(dependency, 'i');
      _.each(services, function(s) {
        if (pattern.exec(s.name)) {
          service.dependencies[s.name] = s;
        }
      });
    } catch (error) {}
  }
}

/*
Group Processing
*/

function buildGroups(services) {
  var groups = {};
  _.each(services, function(service) {
    addServiceToGroup(service, groups);
  });
  return _.toArray(groups);
}

function addServiceToGroup(service, groups) {
  var groupName = service.groupName;
  if (!groups[groupName]) {
    groups[groupName] = newGroup(groupName);
  }
  if (service.properName === 'Site' || service.properName === 'Server') {
    groups[groupName][service.properName.toLowerCase()] = service;
  } else {
    groups[groupName].features.push(service);
  }
}

function newGroup(groupName) {
  return {
    name: groupName,
    features: [],
    site: false,
    server: false,
    isOtherGroup: groupName === 'Other Products' || groupName === 'Other Issues'
  };
}

function processGroup(group) {
  var dependencies = {};
  var worstService;
  var allServices = group.features;
  allServices = allServices.concat(group.site || []).concat(group.server || []);

  worstService = allServices[0];

  _.each(allServices, function(service) {
    worstService = worseStatusService(worstService, service);
    _.each(service.dependencies, function(dependency) {
      dependencies[dependency.name] = dependency;
    });
  });

  group.status = worstService.status;
  group.statusNumber = statusToNumber(group.status);
  group.isOnline = isOnline(group);

  group.id = group.name.toLowerCase().replace(/\s/g, '-');

  group.dependencies = _.toArray(dependencies);

}

/*
Utility Functions
*/

function isPrimaryService(service) {
  return service.description.indexOf('[dashboard-primary]') !== -1;
}

function groupRegexComponent(value, index) {
  // Current format: <groupName>: <serviceName>
  var match = /([^:]*):(.*)/.exec(value);
  return (match ? match[index] : value).trim();
}

function getServiceGroupName(service) {
  if (isPrimaryService(service)) {
    return groupRegexComponent(service.name, 1);
  }
  return isOnline(service) ? 'Other Products' : 'Other Issues';
}

function getServiceName(service) {
  if (isPrimaryService(service)) {
    return groupRegexComponent(service.name, 2);
  }
  return service.name;
}

function statusToNumber(status) {
  var statuses = {
    critical: 4,
    warning: 3,
    active: 2,
    maintenance: 1,
    disabled: 0
  };
  return statuses[status] || -1;
}

function isOnline(object) {
  return statusToNumber(object.status) < 3;
}

function worseStatusService(firstService, secondService) {
  return firstService.statusNumber > secondService.statusNumber ?
    firstService :
    secondService;
}
