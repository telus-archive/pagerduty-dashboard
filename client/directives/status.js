app.directive('status', function() {
  return {
    restrict: 'E',
    templateUrl: 'partials/status.html',
    scope: {
      status: '='
    }
  };
});
