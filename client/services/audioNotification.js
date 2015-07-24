app.factory('audioNotification', function(onDataUpdate) {
  function init() {
    var body = angular.element(document).find('body').eq(0);
    var audio = angular.element('<audio></audio>');
    body.append(audio);
  }

  return {
    init: init
  };
});
