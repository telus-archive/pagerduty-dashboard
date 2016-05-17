// listens for status updates from the server and notifies other modules
module.exports = function (sockets, getGroupsToShow, displaySettings, audioNotifications) {
  var data;
  var groupsToShow;
  var listeners = [];

  // sends an update to to a single listener
  function sendDataToListener (listener) {
    listener(data, groupsToShow);
  }

  // determines the groups to show, triggers audio notifications and notifies other modules
  function sendUpdate () {
    if (data) {
      groupsToShow = getGroupsToShow(data.groups);
      audioNotifications.handleDataChange(data, groupsToShow);
      listeners.forEach(sendDataToListener);
    }
  }

  // if the user has changed display settings, recalculate the groups to show
  displaySettings.onUpdate(sendUpdate);

  // when the server sends data, only trigger updates if the data has changed
  sockets.on('update', function (newData) {
    if (!data || data.hash !== newData.hash) {
      data = newData;
      sendUpdate();
    }
  });

  // allow other modules to register themselves as listeners to data changes
  function onChange (listener) {
    listeners.push(listener);
    if (data) {
      sendDataToListener(listener);
    }
  }

  return {
    onChange: onChange,
    updateGroupsToShow: sendUpdate
  };
};
