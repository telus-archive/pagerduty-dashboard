app.factory('buildGroupsToShow', function(dashboardSettings) {

  function compareGroups(a, b) {
    var aCutoff = dashboardSettings.getGroupOrder(a.id);
    var bCutoff = dashboardSettings.getGroupOrder(b.id);
    if (a.status !== b.status) {
      return a.statusNumber > b.statusNumber ? -1 : 1;
    }
    if (aCutoff !== bCutoff) {
      return aCutoff > bCutoff ? -1 : 1;
    }
    if (a.isOtherGroup) {
      return 1;
    }
    if (b.isOtherGroup) {
      return -1;
    }
    if (a.numberFailures !== b.numberFailures) {
      return a.numberFailures > b.numberFailures ? -1 : 1;
    }
    if (a.features.length !== b.features.length) {
      return a.features.length > b.features.length ? -1 : 1;
    }
    return 0;
  }

  function isVisible(group) {
    var groupOrder = dashboardSettings.getGroupOrder(group.id);
    var groupCutoff = dashboardSettings.getValue('orderCutoff');
    if (groupOrder < groupCutoff) {
      return false;
    }
    if (group.features.length || group.site || group.server) {
      return true;
    }
    return false;
  }

  function buildGroupsToShow(rawGroups) {
    return rawGroups.filter(isVisible).sort(compareGroups);
  }

  return buildGroupsToShow;
});
