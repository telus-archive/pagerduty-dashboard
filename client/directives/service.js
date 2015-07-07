app.directive('service', function(dashboardSettings) {
  return {
    restrict: 'E',
    templateUrl: 'partials/service.html',
    scope: {
      service: '='
    },
    link: function(scope) {
      scope.subdomain = dashboardSettings.subdomain;
    }
  };
});
