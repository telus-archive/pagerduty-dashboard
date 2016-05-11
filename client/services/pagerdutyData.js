module.exports = function (sockets, getGroupsToShow, displaySettings, audioNotifications) {
  var data;
  var groupsToShow;
  var listeners = [];

  function sendDataToListener (listener) {
    listener(data, groupsToShow);
  }

  function sendUpdate () {
    if (data) {
      groupsToShow = getGroupsToShow(data.groups);
      audioNotifications.handleDataChange(data, groupsToShow);
      listeners.forEach(sendDataToListener);
    }
  }

  displaySettings.onUpdate(sendUpdate);
  sockets.on('update', function (newData) {
    if (!data || data.hash !== newData.hash) {
      data = newData;
      sendUpdate();
    }
  });

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
