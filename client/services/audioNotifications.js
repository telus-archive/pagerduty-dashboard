// service for playing sounds in response to events and managing related settings
module.exports = function (displaySettings) {
  // minimum time between playing sounds, even if the status has not changed
  var AUDIO_INTERVAL_TIME = 1000 * 60 * 30; // 30 minutes
  var audioInterval;

  var currentStatus = 'active';
  var audioElements = {
    // use multiple audio elements for each state to prevent loading delays
    'critical': document.createElement('audio'),
    'warning': document.createElement('audio'),
    'active': document.createElement('audio')
  };
  var eventTypes = [
    'active',
    'warning',
    'critical'
  ];

  // the default sound files are in the sounds folder in public_html
  function getDefaultSound (eventType) {
    return 'sounds/' + eventType + '.mp3';
  }

  // register the new sound file, or reset it to the default if no data provided
  function setEventSound (eventType, sound) {
    sound = sound || getDefaultSound(eventType);
    if (audioElements[eventType].src !== sound) {
      audioElements[eventType].src = sound;
    }
  }

  // if sounds are enabled, play the sound for the current state
  function playSound () {
    if (displaySettings.getValue('soundsPlay') && audioElements[currentStatus]) {
      audioElements[currentStatus].play();
    }
  }

  // call this function when the global status has changed
  function changeCurrentStatus (status) {
    currentStatus = status;
    if (audioInterval) {
      clearInterval(audioInterval);
    }
    playSound();
    // play the sound every so often, even if the status has not changed
    audioInterval = setInterval(playSound, AUDIO_INTERVAL_TIME);
  }

  // when the user has changed the settings, check if the sound files changed
  displaySettings.onUpdate(function () {
    eventTypes.forEach(function (eventType) {
      var settingName = 'sounds' + eventType.charAt(0).toUpperCase() + eventType.slice(1);
      setEventSound(eventType, displaySettings.getValue(settingName));
    });
  });

  // function to call when the server has sent a status update
  function handleDataChange (data, groupsToShow) {
    var globalStatus = groupsToShow[0] ? groupsToShow[0].status : '';
    if (currentStatus !== globalStatus) {
      changeCurrentStatus(globalStatus);
    }
  }

  function initialize () {
    // set the sounds to the defaults for each event
    eventTypes.forEach(function (eventType) {
      setEventSound(eventType);
    });
  }

  return {
    initialize: initialize,
    handleDataChange: handleDataChange
  };
};
