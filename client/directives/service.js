module.exports = function () {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'partials/service.html',
    scope: {
      service: '='
    },
    link: function (scope) {
      scope.properCase = function (string) {
        string = string || '';
        return string.charAt(0).toUpperCase() + string.slice(1);
      };
    }
  };
};
