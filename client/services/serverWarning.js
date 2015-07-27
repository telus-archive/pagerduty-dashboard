app.factory('serverWarning', function(noty, socket) {
  var SECONDS = 30;
  var timeoutWarning;

  function reset() {
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

  socket.on('update', reset);
  socket.on('error', function(data) {
    reset();
    noty.update('warning', 'Error communicating with PagerDuty: ' + data);
  });

  return {
    reset: reset
  };
});
