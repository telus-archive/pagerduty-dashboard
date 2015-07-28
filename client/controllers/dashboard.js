app.controller('dashboardController', function($scope, dashboardSettings, onDataChange, processDataPackage) {

  dashboardSettings.setSettingsfromRouteParams();

  onDataChange(function(data) {
    $scope.groups = processDataPackage(data).groups;
  });

  $scope.noGroups = function() {
    return $scope.groups && $scope.groups.length === 0;
  };
});
