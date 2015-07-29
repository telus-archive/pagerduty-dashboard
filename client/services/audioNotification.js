app.factory('audioNotification', function(dashboardSettings) {
  var audioElements = {
    'critical': document.createElement('audio'),
    'warning': document.createElement('audio'),
    'active': document.createElement('audio')
  };

  function getDefaultSound(type) {
    return 'sounds/' + type + '.mp3';
  }

  function updateSound(type) {
    audioElements[type].src = getDefaultSound(type);
  }

  function playSound(type) {
    if(dashboardSettings.getSettings().playSounds) {
      audioElements[type].play();
    }
  }

  function handleDataChange(data) {
    updateSound('active');
    updateSound('warning');
    updateSound('critical');

/*
  //todo
    onDataChange(function(newStatus, oldStatus) {
      if (oldStatus !== 'critical' && newStatus === 'critical') {
        playSound('critical');
      } else if (oldStatus !== 'warning' && newStatus === 'warning') {
        playSound('warning');
      } else if (oldStatus !== newStatus && newStatus === 'active') {
        playSound('active');
      }
    });*/
  }

  return {
    handleDataChange: handleDataChange
  };
});
