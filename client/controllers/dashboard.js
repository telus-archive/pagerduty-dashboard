app.controller('dashboardController', function($scope, dashboardSettings) {
  dashboardSettings.setSettingsfromRouteParams();
  $scope.noGroups = function() {
    return dashboardSettings.numberGroups < 1;
  };
});
