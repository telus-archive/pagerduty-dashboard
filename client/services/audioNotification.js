app.factory('audioNotification', function(dashboardSettings) {
  var lastStatus;
  var audioElement;

  function getDegradeSound() {
    return 'sounds/serviceDown.mp3';
  }

  function playDegradeSound() {
    if (dashboardSettings.getSettings().playSounds) {
      audioElement.src = getDegradeSound();
      audioElement.play();
    }
  }

  function getImproveSound() {
    return 'sounds/serviceUp.mp3';
  }

  function playImproveSound() {
    if (dashboardSettings.getSettings().playSounds) {
      audioElement.src = getImproveSound();
      audioElement.play();
    }
  }

  function init() {
    audioElement = document.createElement('audio');

    dashboardSettings.onGlobalStatusChange(function(status) {
      if (lastStatus !== 'critical' && status === 'critical') {
        playDegradeSound();
      } else if (lastStatus !== 'warning' && lastStatus !== 'critical' && status === 'warning') {
        playDegradeSound();
      } else if (lastStatus !== status) {
        playImproveSound();
      }
      lastStatus = status;
    });
  }

  return {
    init: init
  };
});
