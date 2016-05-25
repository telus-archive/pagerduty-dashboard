// determine which groups to show and their ordering based of the current settings
module.exports = function (displaySettings) {
  // determine the relative ordering of two groups
  // return -1 if 'a' comes before 'b'
  // return  0 if they are effectively equal
  // return  1 if 'b' comes before 'a'
  function compareGroups (a, b) {
    var aOrder = displaySettings.getGroupOrder(a.id);
    var bOrder = displaySettings.getGroupOrder(b.id);

    // if they are different statuses, always show the worse group higher
    if (a.status !== b.status) {
      return a.statusNumber > b.statusNumber ? -1 : 1;
    }

    // if they have differing orders, show the higher one
    if (aOrder !== bOrder) {
      return aOrder > bOrder ? -1 : 1;
    }

    // if one of them is a non-core group, put that one lower
    if (a.isOtherGroup) {
      return 1;
    }
    if (b.isOtherGroup) {
      return -1;
    }

    // show the one with more failing services higher
    if (a.numberFailures !== b.numberFailures) {
      return a.numberFailures > b.numberFailures ? -1 : 1;
    }

    // finally, attempt to sort by number of features
    if (a.features.length !== b.features.length) {
      return a.features.length > b.features.length ? -1 : 1;
    }

    return 0;
  }

  // returns true if a group should be shown
  function isVisible (group) {
    var groupOrder = displaySettings.getGroupOrder(group.id);
    var groupCutoff = displaySettings.getValue('orderCutoff');
    // all groups lower than the cutoff should not be shown
    if (groupOrder < groupCutoff) {
      return false;
    }
    // if the group is non-empty, show it
    if (group.features.length || group.site || group.server) {
      return true;
    }
    return false;
  }

  function getGroupsToShow (rawGroups) {
    return rawGroups.filter(isVisible).sort(compareGroups);
  }

  return getGroupsToShow;
};
