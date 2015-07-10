app.controller('customizationController', function($scope, dashboardSettings) {
  $scope.settings = dashboardSettings.settings;
  $scope.settingControl = dashboardSettings;
});
