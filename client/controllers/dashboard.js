// controller for the dashboard (main) view
module.exports = function (displaySettings, $scope, pagerdutyData) {
  $scope.groups = [];
  displaySettings.setSettingsfromRouteParams();

  pagerdutyData.onChange(function (data, groupsToShow) {
    $scope.groups = groupsToShow;
  });
};
