var _ = require('underscore');
var crypto = require('crypto');
/*
Exports and processing workflow
*/

module.exports = {
  processServices: function (services) {
    return new Services(services);
  }
};

function Services (services) {
  // this.services is an object
  this.services = processServices(services);
  parseServicesDependencies(this.services);
  // this.groups is an array
  this.groups = buildGroups(this.services);
  processGroups(this.groups);
  this.problems = _.any(this.groups, function (group) {
    return !isOnline(group.statusNumber);
  });
}

Services.prototype.addIncidents = function (incidents) {
  var services = this.services;
  _.each(incidents, function (incident) {
    if(services[incident.service.name]) {
      addIncidentToService(incident, services[incident.service.name]);
    }
  });
}

Services.prototype.package = function () {
  return {
    groups: this.groups,
    problems: this.problems,
    hash: crypto.createHash('md5').update(JSON.stringify(this.groups)).digest("hex")
  };
}

/*
Service Processing
*/

function processServices(services) {
  var servicesObject = {};
  _.each(services, function (service) {
    servicesObject[service.name] = processService(service);
  });
  return servicesObject;
}

function processService(service) {
  service.statusNumber = statusToNumber(service.status);
  service.isOnline = isOnline(service.statusNumber);
  if(isPrimaryService(service)) {
    service.properName = serviceNameFromFullName(service.name);
    service.group = groupNameFromFullName(service.name);
  } else {
    service.properName = service.name;
    if(isOnline(service.statusNumber)) {
      service.group = 'Other Products';
    } else {
      service.group = 'Other Issues';
    }
  }
  return service;
}

function parseServicesDependencies (services) {
  _.each(services, function (service) {
    parseServiceDependencies(service, services);
  });
}

function parseServiceDependencies(service, services) {
  // Format: [dashboard-depends:Service Name 1, Service Name 2]
  var dependencies = /\[dashboard-depends\|(.*)]/.exec(service.description);
  service.dependencies = {};
  if(dependencies) {
    dependencies = dependencies[1].split(',');
    _.each(dependencies, function (dependency) {
      dependency = dependency.trim();
      addDependencyToService(dependency, service, services);
    });
  }
  service.dependencies = _.toArray(service.dependencies);
}

function addDependencyToService (dependency, service, services) {
  if(services[dependency]) {
    // prevents duplication by overwriting
    service.dependencies[dependency] = services[dependency];
  } else {
    // attempt to parse as regex
    try {
      var pattern = new RegExp(dependency, 'i');
      _.each(services, function (s) {
        if(pattern.exec(s.name)) {
          service.dependencies[s.name] = s;
        }
      });
    } catch (error) {
    }
  }
}

/*
Group Processing
*/

function buildGroups(services) {
  var groups = {};
  _.each(services, function (service) {
    addServiceToGroup(service, service.group, groups);
  });
  return _.toArray(groups);
}

function addServiceToGroup(service, groupName, groups) {
  if(!groups[groupName]) {
    groups[groupName] = {
      name: groupName,
      features: [],
      site: false,
      server: false,
      isOtherGroup: groupName === 'Other Products' || groupName === 'Other Issues'
    };
  }
  groups[groupName].features.push(service);
  if(service.properName === 'Site' || service.properName === 'Server') {
    groups[groupName][service.properName.toLowerCase()] = service;
  }
}

function processGroups(groups) {
  _.each(groups, function (group) {
    processGroup(group);
  });
}

function processGroup(group) {
  group.status = _.reduce(group.features, worseStatusService).status;
  group.statusNumber = statusToNumber(group.status);
  group.isOnline = isOnline(group.statusNumber);
  group.nonSiteServerFeatures = group.features.length;
  group.id = group.name.toLowerCase().replace(/\s/g,'-');
  if(group.site) {
    group.nonSiteServerFeatures -= 1;
  }
  if(group.server) {
    group.nonSiteServerFeatures -= 1;
  }
  resolveGroupDependencies(group);
  return group;
}

function resolveGroupDependencies(group) {
  var dependencies = {};
  _.each(group.features, function (service){
    _.each(service.dependencies, function (dependency) {
      // prevents duplication by overwriting
      dependencies[dependency.name] = dependency;
    });
  });
  group.dependencies = _.toArray(dependencies);
}

/*
Incident Processing
*/

function addIncidentToService(incident, service) {
  if(!service.incidents) {
    service.incidents = [];
  }
  service.incidents.push(incident);
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

function groupNameFromFullName(name) {
  return groupRegexComponent(name, 1);
}

function serviceNameFromFullName(name) {
  return groupRegexComponent(name, 2);
}

function statusToNumber(status) {
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

function isOnline(statusNumber) {
  return statusNumber < 3;
}

function worseStatusService(firstService, secondService) {
  return (firstService.statusNumber > secondService.statusNumber
    ? firstService
    : secondService);
}
