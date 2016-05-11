var angular = window.angular = require('angular');
window.humanizeDuration = require('humanize-duration');
window.moment = require('moment');

require('angular-route');
require('angular-timer');
var app = angular.module('pagerdutyDashboard', ['ngRoute', 'timer']);

app.controller('customizationController', require('./controllers/customization'));
app.controller('dashboardController', require('./controllers/dashboard'));
app.controller('globalController', require('./controllers/global'));

app.directive('group', require('./directives/group'));
app.directive('service', require('./directives/service'));
app.directive('status', require('./directives/status'));

app.factory('audioNotifications', require('./services/audioNotifications'));
app.factory('displaySettings', require('./services/displaySettings'));
app.factory('getGroupsToShow', require('./services/getGroupsToShow'));
app.factory('noty', require('./services/noty'));
app.factory('pagerdutyData', require('./services/pagerdutyData'));
app.factory('serverStatus', require('./services/serverStatus'));
app.factory('sockets', require('./services/sockets'));

app.filter('groupsColumn', require('./services/groupColumnFilter'));

app.config(function ($routeProvider) {
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

app.run(function (serverStatus, audioNotifications) {
  serverStatus.initialize();
  audioNotifications.initialize();
});
