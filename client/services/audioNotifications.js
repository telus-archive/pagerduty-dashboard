app.factory('audioNotifications', function(dashboardSettings) {
  var lastStatus;
  var audioElements = {
    'critical': document.createElement('audio'),
    'warning': document.createElement('audio'),
    'active': document.createElement('audio')
  };
  var eventTypes = [
    'active',
    'warning',
    'critical'
  ];

  function getDefaultSound(eventType) {
    return 'sounds/' + eventType + '.mp3';
  }

  function setEventSound(eventType, sound) {
    sound = sound || getDefaultSound(eventType);
    if (audioElements[eventType].src !== sound) {
      audioElements[eventType].src = sound;
    }
  }

  function playSound(type) {
    if (dashboardSettings.getValue('soundsPlay')) {
      audioElements[type].play();
    }
  }

  dashboardSettings.onUpdate(function() {
    eventTypes.forEach(function(eventType) {
      var settingName = 'sounds' + eventType.charAt(0).toUpperCase() + eventType.slice(1);
      setEventSound(eventType, dashboardSettings.getValue(settingName));
    });
  });

  function handleDataChange(data, groupsToShow) {
    var globalStatus = groupsToShow[0] ? groupsToShow[0].status : '';
    if (lastStatus !== 'critical' && globalStatus === 'critical') {
      playSound('critical');
    } else if (lastStatus !== 'warning' && globalStatus === 'warning') {
      playSound('warning');
    } else if (lastStatus !== globalStatus && globalStatus === 'active') {
      playSound('active');
    }
    lastStatus = globalStatus;
  }

  function initialize() {
    eventTypes.forEach(function(eventType) {
      setEventSound(eventType);
    });
  }

  return {
    initialize: initialize,
    handleDataChange: handleDataChange
  };
});
