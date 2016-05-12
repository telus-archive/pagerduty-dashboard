window.angular = require('angular');
window.humanizeDuration = require('humanize-duration');
window.moment = require('moment');

require('angular-route');
require('angular-timer');

window.angular.module('pagerdutyDashboard', ['ngRoute', 'timer'])

.controller('customizationController', require('./controllers/customization'))
.controller('dashboardController', require('./controllers/dashboard'))
.controller('globalController', require('./controllers/global'))

.directive('group', require('./directives/group'))
.directive('service', require('./directives/service'))
.directive('status', require('./directives/status'))

.factory('audioNotifications', require('./services/audioNotifications'))
.factory('displaySettings', require('./services/displaySettings'))
.factory('getGroupsToShow', require('./services/getGroupsToShow'))
.factory('noty', require('./services/noty'))
.factory('pagerdutyData', require('./services/pagerdutyData'))
.factory('serverStatus', require('./services/serverStatus'))
.factory('sockets', require('./services/sockets'))

.filter('groupsColumn', require('./services/groupColumnFilter'))

.config(function ($routeProvider) {
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
})

.run(function (serverStatus, audioNotifications) {
  serverStatus.initialize();
  audioNotifications.initialize();
});
