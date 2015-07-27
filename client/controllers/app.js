app.controller('appController',
  function($scope, dashboardSettings, onDataUpdate, serverWarning) {
    $scope.loaded = false;
    $scope.getUiSettings = dashboardSettings.toBodyCssClass;

    onDataUpdate(function(data) {
      $scope.cachedData = $scope.cachedData || data;
      if (data.groups.length !== $scope.cachedData.groups.length) {
        $scope.cachedData = data;
      }
      $scope.loaded = true;
      $scope.data = data;
      dashboardSettings.subdomain = data.subdomain;
      if (dashboardSettings.settings.scrollTop) {
        $('html, body').animate({
          scrollTop: 0
        });
      }
    });

    serverWarning.reset();
  }
);
