module.exports = function (noty, sockets) {
  var SECONDS = 30;
  var timeoutWarning;

  function resetTimeout () {
    if (timeoutWarning !== undefined) {
      clearTimeout(timeoutWarning);
    }
    timeoutWarning = setTimeout(function () {
      noty.update('warning',
        'The server has not sent updates in the last ' +
        SECONDS + ' seconds.');
    }, 1000 * SECONDS);
  }

  function reset () {
    noty.clear();
    resetTimeout();
  }

  return {
    initialize: function () {
      sockets.on('update', reset);
      sockets.on('error', function (data) {
        resetTimeout();
        noty.update('warning', 'Error communicating with PagerDuty: ' + data);
      });
    }
  };
};
