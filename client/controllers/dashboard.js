app.controller('dashboardController', function(dashboardSettings, $scope, dataPackage) {
  $scope.groups = [];
  dashboardSettings.setSettingsfromRouteParams();

  dataPackage.onChange(function(data, groupsToShow) {
    $scope.groups = groupsToShow;
  });

});
