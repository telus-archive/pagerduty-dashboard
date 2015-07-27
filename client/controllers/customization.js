app.controller('customizationController', function($scope, dashboardSettings) {
  $scope.settings = dashboardSettings.getSettings();
  $scope.settingControl = dashboardSettings;
});
