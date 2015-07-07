app.controller('appController',
  function($scope, noty, socket, dashboardSettings, serverWarning) {
    var hash;
    $scope.loaded = false;
    $scope.getUiSettings = dashboardSettings.toBodyCssClass;

    serverWarning.reset();

    socket.on('error', function(data) {
      serverWarning.reset();
      noty.update('warning', 'Error communicating with PagerDuty: ' + data);
    });

    socket.on('update', function(data) {
      serverWarning.reset();
      if (hash === data.hash) {
        // no need to trigger a new render if the data is the same
        return;
      }
      $scope.cachedData = $scope.cachedData || data;
      if (data.groups.length !== $scope.cachedData.groups.length) {
        $scope.cachedData = data;
      }
      hash = data.hash;
      $scope.loaded = true;
      $scope.data = data;
      dashboardSettings.subdomain = data.subdomain;

      if (dashboardSettings.settings.scrollTop) {
        $('html, body').animate({
          scrollTop: 0
        });
      }
    });
  }
);
