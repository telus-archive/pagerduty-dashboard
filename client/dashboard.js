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
        settings.subdomain = data.subdomain;

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

  app.controller('dashboardController', function($scope, settings) {
    settings.setSettingsfromRouteParams();
    $scope.noGroups = function() {
      return settings.numberGroups < 1;
    };
  });

  /*
  Group Filtering and Sorting
  */

  app.filter('filterGroups', function(settings) {
    var s = settings.settings;

    function compareGroups(a, b) {
      var aCutoff = s.groups[a.id] || 0;
      var bCutoff = s.groups[b.id] || 0;
      if (a.status === b.status) {
        if (aCutoff === bCutoff) {
          if (a.isOtherGroup) {
            return 1;
          }
          return a.features.length > b.features.length ? -1 : 1;
        }
        return aCutoff > bCutoff ? -1 : 1;
      }
      return a.statusNumber > b.statusNumber ? -1 : 1;
    }

    function isVisible(group) {
      var groupOrder = s.groups[group.id] || 0;
      var groupCutoff = s.groupCutoff || 0;
      if (groupOrder < groupCutoff) {
        return false;
      }
      if (group.features.length || group.site || group.server) {
        return true;
      }
      return false;
    }

    return function(groups) {
      if (!groups) {
        return groups;
      }

      var online = [];
      var offline = [];

      groups.forEach(function(group) {
        if (isVisible(group)) {
          (group.isOnline ? online : offline).push(group);
        }
      });

      groups = offline.sort(compareGroups).concat(online.sort(compareGroups));

      settings.setGlobalStatus(groups[0] ? groups[0].status : '');
      settings.numberGroups = groups.length;

      return groups;
    };
  });

  /*
  Socket.io Service
  */

  app.factory('socket', function($rootScope) {
    var socket = io(window.location.origin, {
      path: window.location.pathname + 'socket.io'
    });
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
    var subdomain;
    var numberGroups = 0;
    var defaults = {
      otherProducts: true,
      groupCutoff: 0,
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
      settings.groups = {};
      globalStatus = '';
    }

    function isDefault(setting) {
      return settings[setting] === defaults[setting];
    }

    function toUrl() {
      var url = $location.absUrl();
      url = url.substring(0, url.indexOf('#')) + '#/?';

      Object.keys(settings).forEach(function(setting) {
        if (!isDefault(setting) && setting.indexOf('group') === -1) {
          url += setting + '=' + !defaults[setting] + '&';
        }
      });

      if (!isDefault('groupCutoff')) {
        url += 'groupCutoff=' + settings.groupCutoff + '&';
      }

      Object.keys(settings.groups).forEach(function(groupId) {
        if (settings.groups[groupId] && settings.groups[groupId] !== '0') {
          url += groupId + '-group=' + settings.groups[groupId] + '&';
        }
      });

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
          if (routeParam === 'groupCutoff') {
            settings[routeParam] = $routeParams[routeParam];
          }
        } else {
          settings.groups[routeParam.replace('-group', '')] = $routeParams[routeParam];
        }
      });
    }

    return {
      numberGroups: numberGroups,
      subdomain: subdomain,
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

  app.directive('service', function(settings) {
    return {
      restrict: 'E',
      templateUrl: 'assets/service.html',
      scope: {
        service: '='
      },
      link: function(scope) {
        scope.subdomain = settings.subdomain;
      }
    };
  });

  app.directive('status', function() {
    return {
      restrict: 'E',
      templateUrl: 'assets/status.html',
      scope: {
        status: '='
      }
    };
  });

}());
