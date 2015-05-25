(function() {
  var app = angular.module('pagerdutyDashboard', []);

  app.controller('dashboardController', function(socket, $scope, noty) {
    $scope.loaded = false;

    // Helper to wait for the server to keep sending information
    // Takes care of two things:
    // 1) Client disconnected from the server
    // 2) Server stalled on network call or did not handle an error properly
    var serverTimeout;
    function serverCheck() {
      var SECONDS = 30;
      if(serverTimeout !== undefined) {
        clearTimeout(serverTimeout);
      }
      serverTimeout =  window.setTimeout(function() {
        noty.update('warning',
        'There have been no updates from the server for ' + SECONDS + ' seconds.');
      }, 1000 * SECONDS);
    }

    // When the server properly handles an API/connection error
    socket.on('error', function(data) {
      noty.update('warning', 'Error communicating with PagerDuty: ' + data);
      // reset the server connection check countdown
      serverCheck();
    });

    // When the server sends a data update
    socket.on('update', function(data) {
      $scope.data = data;
      $scope.loaded = true;
      // reset the server connection check countdown
      serverCheck();
    });

  });

  // Simple factory wrapper around Socket.io
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
      },
      emit: function (eventName, data, callback) {
        socket.emit(eventName, data, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            if (callback) {
              callback.apply(socket, args);
            }
          });
        });
      }
    };
  });

  // Simple factory wrapper around Noty
  // - limits notifications to one at a time
  // - will not update if the message and type are the same
  app.factory('noty', function () {
    var currentNoty;
    return {
      update: function(type, message) {
        if(undefined === currentNoty ||
          type != currentNoty.options.type ||
          message != currentNoty.options.text ||
          currentNoty.closed) {
          $.noty.closeAll();
          currentNoty = noty({
            text: message,
            layout: 'bottom',
            type: type
          });
        }
      }
    };
  });

  app.directive('coreGroup', function() {
    return {
      restrict: 'E',
      templateUrl: 'assets/core-group.html'
    };
  });

  app.directive('feature', function() {
    return {
      restrict: 'E',
      templateUrl: 'assets/feature.html'
    };
  });

}());
