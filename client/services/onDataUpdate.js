app.factory('onDataUpdate', function(socket) {
  var listeners = [];
  var currentData;

  function addListener(listener) {
    listeners.push(listener);
    sendDataToListener(listener);
  }

  socket.on('update', function(data) {
    if (!currentData || currentData.hash !== data.hash) {
      currentData = data;
      listeners.forEach(sendDataToListener);
    }
  });

  function sendDataToListener(listener) {
    try {
      if (currentData) {
        listener(currentData);
      }
    } catch (e) {}
  }

  return addListener;
});
