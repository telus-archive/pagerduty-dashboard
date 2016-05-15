var subdomain;

// put the services returned from the API into groups
module.exports = function (rawServices, domain) {
  subdomain = domain || '';
  return buildGroups(decorateServices(rawServices));
};

// given an array of API services, add/derive additional data
function decorateServices (rawServices) {
  var services = {};

  // put them into an object so they can be indexed/referenced by name
  rawServices.forEach(function (rawService) {
    services[rawService.name] = decorateService(rawService);
  });

  // resolve the dependencies between services
  objectForEach(services, function (keyName, service) {
    parseServiceDependencies(service, services);
  });

  return services;
}

// given an API service object, add fields for display and sorting purposes
function decorateService (rawService) {
  var service = {
    properName: getServiceName(rawService),
    groupName: getServiceGroupName(rawService),
    lastIncidentTime: Date.parse(rawService.last_incident_timestamp),
    description: '', // PagerDuty will not always return a description key
    link: 'https://' + subdomain + '.pagerduty.com' + rawService.service_url
  };
  service.isSiteOrServer = service.properName === 'Site' || service.properName === 'Server';

  // attach status related properties like status code/number
  injectStatusProperties(service, rawService.status);

  // copy over all the original properties of rawService
  objectForEach(rawService, function (keyName, value) {
    service[keyName] = value;
  });

  return service;
}

// look at a service's description to find its dependencies
function parseServiceDependencies (service, services) {
  // while processing dependencies, index/reference by name to avoid duplicates
  service.dependencies = {};

  // description convention: [dashboard-depends|list,of,dependencies]
  var dependencyNames = /\[dashboard-depends\|(.*)]/.exec(service.description);
  if (dependencyNames) {
    // dependencyNames[1] would be "list, of, dependencies" from above example
    dependencyNames[1].split(',').forEach(function (dependencyName) {
      addDependencyToService(dependencyName.trim(), service, services);
    });
  }

  // convert the object to an array for convenience client-side
  service.dependencies = toArray(service.dependencies);
}

// given a dependencyName, look for it in services and add the data to service
function addDependencyToService (dependencyName, service, services) {
  if (services[dependencyName]) {
    // found the depdendency by exact name
    service.dependencies[dependencyName] = services[dependencyName];
  } else {
    try {
      // attempt interpreting the dependencyName as a regex
      var pattern = new RegExp(dependencyName, 'i');
      objectForEach(services, function (keyName, otherService) {
        if (pattern.exec(otherService.name)) {
          // found one depdendency by matching against the regex
          service.dependencies[otherService.name] = otherService;
        }
      });
    } catch (error) {} // errors generated during regex processing
  }
}

// names for the special groups
var OTHER_PRODUCTS = 'Other Products';
var OTHER_ISSUES = 'Other Issues';

function buildGroups (services) {
  // while building groups, index/reference by name for convenience
  var groups = {};

  // add the special groups
  groups[OTHER_PRODUCTS] = newGroup(OTHER_PRODUCTS);
  groups[OTHER_ISSUES] = newGroup(OTHER_ISSUES);

  // first sort the services into each group
  objectForEach(services, function (keyName, service) {
    addServiceToGroup(service, groups);
  });

  // then dervice each groups properties and return as an array
  return toArray(groups).map(processGroup);
}

// insert the service record in the appropriate group in groups
function addServiceToGroup (service, groups) {
  var groupName = service.groupName;

  if (!groups[groupName]) {
    // first item to be added to this group, need to create a new group
    groups[groupName] = newGroup(groupName);
  }

  if (service.isSiteOrServer) {
    // site or server services get their own separate entries
    groups[groupName][service.properName.toLowerCase()] = service;
  } else {
    // regular services get added under the features list
    groups[groupName].features.push(service);
  }

  // keep track of the number of failing services in a group
  if (!service.isOnline) {
    groups[groupName].numberFailures += 1;
  }
}

// template for a new group
function newGroup (groupName) {
  return {
    name: groupName,
    id: groupName.toLowerCase().replace(/\s/g, '-'),
    features: [],  // main list of services
    site: false,   // special key if this group has a "site service"
    server: false, // special key if this group has a "server service"
    numberFailures: 0,
    isOtherGroup: groupName === OTHER_PRODUCTS || groupName === OTHER_ISSUES
  };
}

// build a groups depdendency list from its services and add additional properties
function processGroup (group) {
  var dependencies = {};
  var allServices = group.features.concat(group.site || [], group.server || []);
  var worstService = allServices[0]; // temporary value
  var lastIncidentTime;

  allServices.forEach(function (service) {
    if (!service.isOnline) {
      // determine the oldest incident time
      lastIncidentTime = lastIncidentTime
        ? Math.min(service.lastIncidentTime, lastIncidentTime)
        : service.lastIncidentTime;
    }
    // find the worst (status) service in the entire group
    worstService = worseStatusService(worstService, service);
    // add each service's depdendencies to the group's dependency list
    service.dependencies.forEach(function (dependency) {
      dependencies[dependency.name] = dependency;
    });
  });

  // set the status of the group as a whole
  var worseStatus = worstService ? worstService.status : 'disabled';
  injectStatusProperties(group, worseStatus);

  group.lastIncidentTime = lastIncidentTime || 0;
  group.dependencies = toArray(dependencies);

  return group;
}

// does the service get put in the "other" group, or a special group?
function isPrimaryService (service) {
  return service.description.indexOf('[dashboard-primary]') !== -1;
}

// index=0 -> <groupName>
// index=1 -> <serviceName>
function groupRegexComponent (value, index) {
  // Current format: <groupName>: <serviceName>
  var match = /([^:]*):(.*)/.exec(value);
  return (match ? match[index] : value).trim();
}

// determine which group a service belongs to
function getServiceGroupName (service) {
  if (isPrimaryService(service)) {
    // gets put into a user-defined group
    return groupRegexComponent(service.name, 1);
  }
  // gets put in one of the generic "other" groups, depending on its status
  return isOnline(service) ? OTHER_PRODUCTS : OTHER_ISSUES;
}

// determine the proper name of a service
function getServiceName (service) {
  if (isPrimaryService(service)) {
    // keep the service name only and remove the group name
    return groupRegexComponent(service.name, 2);
  }
  // by default, just keep the raw name
  return service.name;
}

// converts a status string to a number, with higher numbers being of worse status
function statusToNumber (status) {
  var statuses = {
    critical: 4,
    warning: 3,
    active: 2,
    maintenance: 1,
    disabled: 0
  };
  return statuses[status] || -1;
}

// is the service not failing ?
function isOnline (object) {
  return statusToNumber(object.status) < 3;
}

// return the worse status service from the two arguments
function worseStatusService (firstService, secondService) {
  return firstService.statusNumber > secondService.statusNumber
    ? firstService : secondService;
}

// decorate a service or group with status properties
function injectStatusProperties (object, status) {
  object.status = status;
  object.statusNumber = statusToNumber(status);
  object.isOnline = isOnline(object);
}

// iterate of the keys of an object with each key's value
function objectForEach (dataObject, operation) {
  Object.keys(dataObject).forEach(function (key, index) {
    operation(key, dataObject[key]);
  });
}

// convert all the properties of an object to an array
function toArray (dataObject) {
  var dataArray = [];
  Object.keys(dataObject).forEach(function (key, index) {
    dataArray.push(dataObject[key]);
  });
  return dataArray;
}
