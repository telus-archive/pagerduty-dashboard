app.directive('service', function(dashboardSettings) {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'partials/service.html',
    scope: {
      service: '='
    }
  };
});
