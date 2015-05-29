(function () {
  var app = angular.module('pagerdutyDashboard', ['ngRoute']);

  /*
  Routing Configuration
  */

  app.config(function ($routeProvider) {
    $routeProvider
    .when('/', {
      templateUrl: 'assets/dashboard.html'
    })
    .when('/customize', {
      templateUrl: 'assets/customize.html',
      controller: 'customizationController'
    })
    .otherwise({
      redirectTo: '/'
    });
  });

  /*
  Main Controller
  */

  app.controller('appController', function ($scope, noty, socket) {
    var timeoutWarning;
    function serverWarningReset() {
      var SECONDS = 30;
      if(timeoutWarning !== undefined) {
        clearTimeout(timeoutWarning);
      }
      noty.clear();
      timeoutWarning =  setTimeout(function () {
        noty.update('warning',
          'There have been no updates from the server for ' + SECONDS + ' seconds.');
      }, 1000 * SECONDS);
    }
    serverWarningReset();

    $scope.loaded = false;

    var hasProblem = false;
    $scope.getUiSettings = function () {
      var classes = '';
      if(hasProblem) {
        classes += 'problem';
      }
      return classes;
    };

    socket.on('error', function (data) {
      serverWarningReset();
      noty.update('warning', 'Error communicating with PagerDuty: ' + data);
    });

    socket.on('update', function (data) {
      serverWarningReset();
      if($scope.hash === data.hash) {
        return;
      }
      $scope.hash = data.hash;
      $scope.loaded = true;
      $scope.data = data;
      if(!$scope.cachedData) {
        // cache the inital update to avoid flickering on customization page
        $scope.cachedData = data;
      }
      hasProblem = data.problems;

    });

  });

  /*
  Secondary Controllers
  */

  app.controller('customizationController', function ($location, $scope) {
    var baseUrl = $location.protocol() + "://" + $location.host();
    baseUrl += ":" + $location.port() + '/#/?';

    $scope.querymode = 'includeall';
    $scope.queryGroups = {};
    $scope.otherProducts = true;
    $scope.otherIssues = true;

    $scope.getUrl = function () {
      var url = baseUrl, key, selected = [], groups = $scope.queryGroups;

      for (key in groups) {
        if (groups.hasOwnProperty(key) && groups[key]) {
          selected.push(key);
        }
      }

      if('include' === $scope.querymode) {
        url += 'include=' + selected.join() + '&';
      } else if ('exclude' === $scope.querymode) {
        url += 'exclude=' + selected.join() + '&';
      }

      if(!$scope.otherProducts) {
        url += 'otherproducts=false&';
      }
      if(!$scope.otherIssues) {
        url += 'otherissues=false&';
      }

      return url;
    };
  });

  /*
  Custom filters
  */

  app.filter('filterGroups', function ($routeParams) {
    function compareGroups(a, b) {
      if(a.status === b.status) {
        return a.features.length > b.features.length ? -1 : 1;
      }
      return a.statusNumber > b.statusNumber ? -1 : 1;
    }

    return function (groups) {
      var otherProducts = $routeParams.otherproducts !== 'false';
      var otherIssues = $routeParams.otherissues !== 'false';
      var queryMode = $routeParams.include !== undefined ? 'include' : 'exclude';
      var queryList = $routeParams[queryMode] ? $routeParams[queryMode].split(',') : [];
      var offCore = [], offOther = [], onCore = [], onOther = [];
      if(!groups) {
        return groups;
      }
      groups.forEach(function (group) {
        if(group.name === "Other Products") {
          onOther = otherProducts ? group : [];
        } else if (group.name === "Other Issues") {
          offOther = otherIssues ?  group : [];
        } else {
          if((queryMode === 'exclude' && queryList.indexOf(group.id) === -1) ||
           (queryMode === 'include' && queryList.indexOf(group.id) !== -1)) {
            if(group.isOnline) {
              onCore.push(group);
            } else {
              offCore.push(group);
            }
          }
        }
      });

      onCore.sort(compareGroups);
      offCore.sort(compareGroups);

      return offCore.concat(offOther, onCore, onOther);
    };
  });

  /*
  Custom factory services
  */

  app.factory('socket', function ($rootScope) {
    var socket = io.connect();
    return {
      on: function (eventName, callback) {
        socket.on(eventName, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            callback.apply(socket, args);
          });
        });
      }
    };
  });

  app.factory('noty', function () {
    var current;
    return {
      update: function (type, message) {
        if(!current || message !== current.options.text || current.closed) {
          $.noty.closeAll();
          current = noty({
            text: message,
            layout: 'bottom',
            type: type
          });
        }
      },
      clear: $.noty.closeAll
    };
  });

  /*
  Custom directives
  */

  app.directive('service', function () {
    return {
      restrict: 'E',
      templateUrl: 'assets/service.html'
    };
  });

}());
