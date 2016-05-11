module.exports = function () {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'partials/group.html',
    scope: {
      group: '='
    }
  };
};
