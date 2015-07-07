var app = angular.module('pagerdutyDashboard', ['ngRoute']);

app.config(function($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'partials/dashboard.html',
      controller: 'dashboardController'
    })
    .when('/customize', {
      templateUrl: 'partials/customize.html',
      controller: 'customizationController'
    })
    .otherwise({
      redirectTo: '/'
    });
});
