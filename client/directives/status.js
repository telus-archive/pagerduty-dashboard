module.exports = function () {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'partials/status.html',
    scope: {
      status: '='
    }
  };
};
