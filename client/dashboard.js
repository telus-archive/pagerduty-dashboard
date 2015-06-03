(function() {
  var app = angular.module('pagerdutyDashboard', ['ngRoute']);

  /*
  Routing Configuration
  */

  app.config(function($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'assets/dashboard.html',
        controller: 'dashboardController'
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

  app.controller('appController',
    function($scope, noty, socket, settings, serverWarning) {
      var hash;
      $scope.loaded = false;
      $scope.getUiSettings = settings.toBodyCssClass;

      serverWarning.reset();

      socket.on('error', function(data) {
        serverWarning.reset();
        noty.update('warning', 'Error communicating with PagerDuty: ' + data);
      });

      socket.on('update', function(data) {
        serverWarning.reset();
        if (hash === data.hash) {
          // no need to trigger a new render if the data is the same
          return;
        }
        $scope.cachedData = $scope.cachedData || data;
        if (data.groups.length !== $scope.cachedData.groups.length) {
          $scope.cachedData = data;
        }
        hash = data.hash;
        $scope.loaded = true;
        $scope.data = data;

        if (settings.settings.scrollTop) {
          $('html, body').animate({
            scrollTop: 0
          });
        }
      });
    }
  );

  /*
  Secondary Controllers
  */

  app.controller('customizationController', function($scope, settings) {
    $scope.settings = settings.settings;
    $scope.settingControl = settings;
  });

  app.controller('dashboardController', function(settings) {
    settings.setSettingsfromRouteParams();
  });

  /*
  Group Filtering and Sorting
  */

  app.filter('filterGroups', function(settings) {
    var s = settings.settings;

    function compareGroups(a, b) {
      if (a.status === b.status) {
        return a.features.length > b.features.length ? -1 : 1;
      }
      return a.statusNumber > b.statusNumber ? -1 : 1;
    }

    function isVisible(group) {
      if (s.queryMode === 'exclude' && s.queryGroups[group.id]) {
        return false;
      }
      if (s.queryMode === 'include' && !s.queryGroups[group.id]) {
        return false;
      }
      return true;
    }

    return function(groups) {
      if (!groups) {
        return groups;
      }

      var offCore = [];
      var offOther = [];
      var onCore = [];
      var onOther = [];

      groups.forEach(function(group) {
        if (group.name === 'Other Products') {
          onOther = s.otherProducts ? group : [];
        } else if (group.name === 'Other Issues') {
          offOther = s.otherIssues ? group : [];
        } else {
          if (isVisible(group)) {
            (group.isOnline ? onCore : offCore).push(group);
          }
        }
      });

      groups = offCore.sort(compareGroups).concat(
        offOther,
        onCore.sort(compareGroups),
        onOther);

      settings.setGlobalStatus(groups[0] ? groups[0].status : '');

      return groups;
    };
  });

  /*
  Socket.io Service
  */

  app.factory('socket', function($rootScope) {
    var socket = io.connect();
    return {
      on: function(eventName, callback) {
        socket.on(eventName, function() {
          var args = arguments;
          $rootScope.$apply(function() {
            callback.apply(socket, args);
          });
        });
      }
    };
  });

  /*
  Noty Service
  */

  app.factory('noty', function() {
    var current;
    return {
      update: function(type, message) {
        if (!current || message !== current.options.text || current.closed) {
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
  Server Communication Problem Service
  */
  app.factory('serverWarning', function(noty) {
    var SECONDS = 30;
    var timeoutWarning;

    return {
      reset: function() {
        if (timeoutWarning !== undefined) {
          noty.clear();
          clearTimeout(timeoutWarning);
        }
        timeoutWarning = setTimeout(function() {
          noty.update('warning',
            'The server has not sent updates in the last ' +
            SECONDS + ' seconds.');
        }, 1000 * SECONDS);
      }
    };
  });

  /*
  Dashboard View Settings
  */

  app.factory('settings', function($routeParams, $location) {
    var settings = {};
    var globalStatus = '';
    var defaults = {
      queryMode: 'includeall',
      queryGroups: {},
      otherProducts: true,
      otherIssues: true,
      animateHeadings: false,
      animatePage: true,
      scrollTop: true
    };

    setDefaultSettings();

    function setDefaultSettings() {
      Object.keys(defaults).forEach(function(setting) {
        settings[setting] = defaults[setting];
      });
      settings.queryGroups = {};
      globalStatus = '';
    }

    function isDefault(setting) {
      return settings[setting] === defaults[setting];
    }

    function toUrl() {
      var url = $location.protocol() + '://' + $location.host() + ':' +
        $location.port() + '/#/?';

      Object.keys(settings).forEach(function(setting) {
        if (!isDefault(setting) && setting.indexOf('query') === -1) {
          url += setting + '=' + !defaults[setting] + '&';
        }
      });

      if (!isDefault('queryMode')) {
        url += settings.queryMode + '=';
        Object.keys(settings.queryGroups).forEach(function(groupId) {
          if (settings.queryGroups[groupId]) {
            url += groupId + ',';
          }
        });
      }

      return url;
    }

    function setGlobalStatus(status) {
      globalStatus = status;
    }

    function toBodyCssClass() {
      var classes = globalStatus;
      if (settings.animatePage) {
        classes += ' animate-background';
      }
      if (settings.animateHeadings) {
        classes += ' animate-headings';
      }
      return classes;
    }

    function setSettingsfromRouteParams() {
      setDefaultSettings();
      Object.keys($routeParams).forEach(function(routeParam) {
        if (defaults[routeParam] !== undefined) {
          settings[routeParam] = ($routeParams[routeParam] === 'true');
        } else if (routeParam === 'exclude' || routeParam === 'include') {
          settings.queryMode = routeParam;
          $routeParams[routeParam].split(',').forEach(function(service) {
            settings.queryGroups[service] = !!service;
          });
        }
      });
    }

    return {
      setGlobalStatus: setGlobalStatus,
      settings: settings,
      setDefaultSettings: setDefaultSettings,
      toUrl: toUrl,
      toBodyCssClass: toBodyCssClass,
      setSettingsfromRouteParams: setSettingsfromRouteParams
    };
  });

  /*
  Custom directives
  */

  app.directive('service', function() {
    return {
      restrict: 'E',
      templateUrl: 'assets/service.html'
    };
  });

}());
