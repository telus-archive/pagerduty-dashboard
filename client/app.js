// globals and requires
window.angular = require('angular');
window.humanizeDuration = require('humanize-duration');
window.moment = require('moment');
window.$ = require('jquery');
window.noty = require('noty');
require('angular-route');
require('angular-timer');

// main module definition
window.angular.module('pagerdutyDashboard', ['ngRoute', 'timer'])

// module components
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

// module configuration and initialization
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
