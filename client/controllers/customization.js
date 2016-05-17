// controller for the customization view
module.exports = function ($scope, displaySettings) {
  $scope.settings = displaySettings.settings;
  $scope.resetGroupOrder = displaySettings.resetGroupOrder;
  $scope.resetSounds = displaySettings.resetSounds;
  $scope.resetAll = displaySettings.setDefaultSettings;
  $scope.url = displaySettings.toUrl;
};
