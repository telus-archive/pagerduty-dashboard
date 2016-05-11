var $ = require('jquery');

module.exports = function ($scope, displaySettings, pagerdutyData) {
  var globalStatus; // the worst status of the shown groups
  $scope.loaded = false;

  function scrollToTopIfEnabled () {
    if (displaySettings.getValue('scrollGoToTop')) {
      $('html, body').animate({
        scrollTop: 0
      });
    }
  }

  $scope.getBodyCssClasses = function () {
    var classes = globalStatus || '';
    if (displaySettings.getValue('animatePage')) {
      classes += ' animate-background';
    }
    if (displaySettings.getValue('animateHeadings')) {
      classes += ' animate-headings';
    }
    if (displaySettings.getValue('scrollHideBar')) {
      classes += ' hide-scroll-bar';
    }
    if (displaySettings.getValue('animateWarnings')) {
      classes += ' animate-warnings';
    }
    return classes;
  };

  pagerdutyData.onChange(function (data, groupsToShow) {
    // the first group (sorted by status) has the worst status
    globalStatus = groupsToShow[0] ? groupsToShow[0].status : '';
    $scope.loaded = true;
    $scope.data = data;
    scrollToTopIfEnabled();
  });
};
