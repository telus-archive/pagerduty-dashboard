app.directive('group', function() {
  return {
    restrict: 'E',
    templateUrl: 'partials/group.html',
    scope: {
      group: '='
    }
  };
});
