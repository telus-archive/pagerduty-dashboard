app.controller('dashboardController', function(dashboardSettings, $scope, dataPackage) {
  $scope.groups = [];
  dashboardSettings.setSettingsfromRouteParams();

  dataPackage.onChange(function(data, groupsToShow) {
    $scope.groups = groupsToShow;
  });

  $scope.isMultiColumn = function() {
    return dashboardSettings.getValue('multiColumn');
  };
});

app.filter('multiColumnXof2', function(dashboardSettings) {

  function minimumIndex(list) {
    var minIndex = 0;
    var minValue = list[0] | 0;
    list.forEach(function(value, index) {
      if (value < minValue) {
        minValue = value;
        minIndex = index;
      }
    });
    return minIndex;
  }

  // rough ratios based of css styles
  function getGroupHeight(group) {
    var height = 0;
    if (group.site || group.server) {
      height += 5;
    }
    if (group.features.length > 0) {
      height += 3 + 3 * Math.ceil(group.features.length / 2);
      if(group.isOtherGroup) {
        // "features" heading does not get displayed
        height -= 3;
      }
    }
    if (group.dependencies.length > 0) {
      height += 3 + 3 * Math.ceil(group.dependencies.length / 2);
    }
    return height;
  }

  return function(groups, columnNumber) {
    var columnHeights = [0, 0];
    var groupsInColumn = [];

    groups.forEach(function(group) {
      var destinationColumn = minimumIndex(columnHeights);
      columnHeights[destinationColumn] += getGroupHeight(group);

      if (destinationColumn + 1 === columnNumber) {
        groupsInColumn.push(group);
      }
    });

    return groupsInColumn;
  };
});
