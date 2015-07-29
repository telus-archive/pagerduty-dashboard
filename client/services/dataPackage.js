app.factory('dataPackage', function(socket, audioNotification,
  serverNotification, buildGroupsToShow, dashboardSettings) {

  var data;
  var groupsToShow;
  var listeners = [];

  function sendDataToListener(listener) {
    listener(data, groupsToShow);
  }

  function sendUpdate() {
    if (data) {
      groupsToShow = buildGroupsToShow(data.groups);
      audioNotification.handleDataChange(data);
      listeners.forEach(sendDataToListener);
    }
  }

  dashboardSettings.onUpdate(sendUpdate);
  socket.on('update', function(newData) {
    serverNotification.reset();
    if (!data || data.hash !== newData.hash) {
      data = newData;
      sendUpdate();
    }
  });

  function onDataPackageChange(listener) {
    listeners.push(listener);
    if (data) {
      sendDataToListener(listener);
    }
  }



  serverNotification.reset();
  return {
    onChange: onDataPackageChange,
    updateGroupsToShow: sendUpdate
  };
});
