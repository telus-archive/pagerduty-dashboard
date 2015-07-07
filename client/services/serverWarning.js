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
