app.controller('customizationController', function($scope, dashboardSettings) {
  $scope.settings = dashboardSettings.settings;
  $scope.resetGroupOrder = dashboardSettings.resetGroupOrder;
  $scope.resetAll = dashboardSettings.setDefaultSettings;
  $scope.url = dashboardSettings.toUrl;
});
