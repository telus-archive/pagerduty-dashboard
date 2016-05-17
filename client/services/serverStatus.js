// deal with communication problems with the server and display related messages
module.exports = function (noty, sockets) {
  // display a warning if the server has not communicated in this many seconds
  var SECONDS = 30;
  var timeoutWarning;

  // (re)set a countdown about the server not sending any data
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

  // clear any notifications and reset the countdown
  function reset () {
    noty.clear();
    resetTimeout();
  }

  return {
    initialize: function () {
      // when the server sends any sort of data, clear communication errors
      sockets.on('update', reset);

      // if the server sent an error, display a notification
      sockets.on('error', function (data) {
        resetTimeout();
        noty.update('warning', 'Error communicating with PagerDuty: ' + data);
      });
    }
  };
};
