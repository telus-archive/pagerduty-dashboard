app.filter('filterGroups', function(dashboardSettings) {
  var s = dashboardSettings.settings;

  function compareGroups(a, b) {
    var aCutoff = s.groups[a.id] || 0;
    var bCutoff = s.groups[b.id] || 0;
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
    return a.features.length > b.features.length ? -1 : 1;
  }

  function isVisible(group) {
    var groupOrder = s.groups[group.id] || 0;
    var groupCutoff = s.groupCutoff || 0;
    if (groupOrder < groupCutoff) {
      return false;
    }
    if (group.features.length || group.site || group.server) {
      return true;
    }
    return false;
  }

  return function(groups, status) {
    if (!groups) {
      return groups;
    }

    var online = [];
    var offline = [];

    groups.forEach(function(group) {
      if (isVisible(group)) {
        if (group.isOnline && status !== 'offline') {
          online.push(group);
        }
        if (!group.isOnline && status !== 'online') {
          offline.push(group);
        }
      }
    });

    groups = offline.sort(compareGroups).concat(online.sort(compareGroups));

    dashboardSettings.setGlobalStatus(groups[0] ? groups[0].status : '');
    dashboardSettings.numberGroups = groups.length;

    return groups;
  };
});
