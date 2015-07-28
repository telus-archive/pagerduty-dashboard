app.factory('onDataChange', function(socket) {
  var currentData;
  var listeners = [];

  function onDataChange(listener) {
    listeners.push(listener);
    if (currentData) {
      sendDataToListener(listener);
    }
  }

  socket.on('update', function(data) {
    if (!currentData || currentData.hash !== data.hash) {
      currentData = data;
      listeners.forEach(sendDataToListener);
    }
  });

  function sendDataToListener(listener) {
    try {
      listener(currentData);
    } catch (e) {}
  }

  return onDataChange;
});
