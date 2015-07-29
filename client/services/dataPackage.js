app.factory('dataPackage',
  function(socket, audioNotification, serverNotification, buildGroupsToShow) {
    var data;
    var groupsToShow;
    var listeners = [];

    function sendDataToListener(listener) {
      listener(data, groupsToShow);
    }

    socket.on('update', function(newData) {
      if (!data || data.hash !== newData.hash) {
        data = newData;
        groupsToShow = buildGroupsToShow(data.groups);

        audioNotification.handleDataChange(data);
        serverNotification.reset();
        listeners.forEach(sendDataToListener);
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
      onChange: onDataPackageChange
    };
  });
