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
