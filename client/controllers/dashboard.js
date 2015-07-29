app.controller('dashboardController', function($scope, dashboardSettings, onDataChange, processDataPackage) {
  dashboardSettings.setSettingsfromRouteParams();

  $scope.noGroups = function() {
    return !$scope.groups || $scope.groups.length === 0;
  };

  $scope.getGroups = function() {
    return processDataPackage($scope.data).groups;
  };
});
