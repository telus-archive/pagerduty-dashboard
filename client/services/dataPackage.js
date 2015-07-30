app.factory('dataPackage', function(socket, buildGroupsToShow, dashboardSettings, audioNotifications) {

  var data;
  var groupsToShow;
  var listeners = [];

  function sendDataToListener(listener) {
    listener(data, groupsToShow);
  }

  function sendUpdate() {
    if (data) {
      groupsToShow = buildGroupsToShow(data.groups);
      audioNotifications.handleDataChange(data, groupsToShow);
      listeners.forEach(sendDataToListener);
    }
  }

  dashboardSettings.onUpdate(sendUpdate);
  socket.on('update', function(newData) {
    //serverNotification.reset();
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

  return {
    onChange: onDataPackageChange,
    updateGroupsToShow: sendUpdate
  };
});
