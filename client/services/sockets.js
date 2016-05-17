// wrapper around socket.io that forces Angular to re-draw on updates
module.exports = function ($rootScope) {
  var connection = io(window.location.origin, {
    path: window.location.pathname + 'socket.io'
  });
  return {
    on: function (eventName, callback) {
      connection.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(connection, args);
        });
      });
    }
  };
};
