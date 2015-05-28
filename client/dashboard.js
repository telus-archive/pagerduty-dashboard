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
    $scope.baseUrl = $location.protocol() + "://" + $location.host() + ":" + $location.port() + '/#/?';
  });

  app.controller('groupController', function ($scope) {
  });

  /*
  Custom filters
  */

  app.filter('filterGroups', function () {
    // Order
    // 1) Offline core groups
    // 2) Offline other services
    // 3) Online core groups
    // 4) Online other services

    function compareGroups(a, b) {
      if(a.status === b.status) {
        return a.features.length > b.features.length ? -1 : 1;
      }
      return a.statusNumber > b.statusNumber ? -1 : 1;
    }

    // TODO: take include/exclude list into consideration
    return function (groups) {
      var offCore = [], offOther = [], onCore = [], onOther = [];
      if(!groups) {
        return groups;
      }
      groups.forEach(function (group) {
        if(group.name === "Other Products") {
          onOther = group;
        } else if (group.name === "Other Issues") {
          offOther = group;
        } else if(group.isOnline) {
          onCore.push(group);
        } else {
          offCore.push(group);
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
