// filter that separates groups into two columns in the user interface
module.exports = function () {
  // helper function: rough ratios based off css styles
  function getGroupHeight (group) {
    var height = 42;
    if (group.site || group.server) {
      height += 56;
    }
    if (group.features.length > 0) {
      height += 14 + 23 + 29 * Math.ceil(group.features.length / 2);
      if (group.dependencies.length === 0 && !group.site && !group.server) {
        // "features" heading does not get displayed
        height -= 28;
      }
    }
    if (group.dependencies.length > 0) {
      height += 14 + 23 + 29 * Math.ceil(group.dependencies.length / 2);
    }
    return height;
  }

  // angular filtering function
  return function (groups, columnNumber) {
    var columns = {
      left: {
        height: 0,
        groups: []
      },
      right: {
        height: 0,
        groups: []
      }
    };

    groups.forEach(function (group, index) {
      var column = columns[columns.left.height <= columns.right.height + 25 ? 'left' : 'right'];
      column.height += getGroupHeight(group);
      column.groups.push(group);
    });

    return columns[columnNumber === 1 ? 'left' : 'right'].groups;
  };
};
