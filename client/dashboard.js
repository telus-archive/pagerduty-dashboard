(function() {
  var app = angular.module('pagerdutyDashboard', []);

  app.controller('dashboardController', function(socket, $scope, noty) {
    $scope.loaded = false;

    // Helper to wait for the server to keep sending information
    // Takes care of two things in one:
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
    });

    // When the server sends a data update
    socket.on('update', function(data) {
      var stats = data.stats;
      $scope.groups = data.groups;
      $scope.loaded = true;

      if(stats.problems > 0) {
        var errorMessage;
        errorMessage = stats.problems + ' service groups have issues. ';
        if(stats.problems == 1) {
          errorMessage = '1 service group has issues. ';
        }
        noty.update('error', errorMessage);
      } else {
        noty.update('success', 'All services are running normally.');
      }

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
  // - will not update if the message is the same
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

  app.filter('descendingPriority', function(){
    return function(input) {
      if (!angular.isObject(input)) return input;

      var array = [];
      for(var objectKey in input) {
        array.push(input[objectKey]);
      }
      array.sort(function(a, b){
        return b.statusPriority - a.statusPriority;
      });
      return array;
    };
  });


}());
