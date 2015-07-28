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

  function init() {
    var lastStatus;

    updateSound('active');
    updateSound('warning');
    updateSound('critical');

    dashboardSettings.onGlobalStatusChange(function(status) {
      if (lastStatus !== 'critical' && status === 'critical') {
        playSound('critical');
      } else if (lastStatus !== 'warning' && status === 'warning') {
        playSound('warning');
      } else if (lastStatus !== status && status === 'active') {
        playSound('active');
      }
      lastStatus = status;
    });
  }

  return {
    init: init
  };
});
