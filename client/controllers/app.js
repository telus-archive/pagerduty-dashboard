app.controller('appController', function($scope, dashboardSettings, dataPackage) {
  var globalStatus;
  $scope.loaded = false;

  function scrollToTopIfEnabled() {
    if (dashboardSettings.getValue('scrollGoToTop')) {
      $('html, body').animate({
        scrollTop: 0
      });
    }
  }

  $scope.getBodyCssClasses = function() {
    var classes = globalStatus || '';
    if (dashboardSettings.getValue('animatePage')) {
      classes += ' animate-background';
    }
    if (dashboardSettings.getValue('animateHeadings')) {
      classes += ' animate-headings';
    }
    if (dashboardSettings.getValue('scrollHideBar')) {
      classes += ' hide-scroll-bar';
    }
    if (dashboardSettings.getValue('animateWarnings')) {
      classes += ' animate-warnings';
    }
    return classes;
  };

  dataPackage.onChange(function(data, groupsToShow) {
    globalStatus = groupsToShow[0] ? groupsToShow[0].status : '';
    $scope.loaded = true;
    $scope.data = data;
    scrollToTopIfEnabled();
  });
});
