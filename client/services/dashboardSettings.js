app.factory('dashboardSettings', function($routeParams, $location) {
  var settings = {};
  var globalStatus = '';
  var subdomain;
  var numberGroups = 0;
  var defaults = {
    otherProducts: true,
    groupCutoff: 0,
    otherIssues: true,
    animateHeadings: false,
    animatePage: true,
    scrollTop: true
  };

  setDefaultSettings();

  function setDefaultSettings() {
    Object.keys(defaults).forEach(function(setting) {
      settings[setting] = defaults[setting];
    });
    settings.groups = {};
    globalStatus = '';
  }

  function isDefault(setting) {
    return settings[setting] === defaults[setting];
  }

  function toUrl() {
    var url = $location.absUrl();
    url = url.substring(0, url.indexOf('#')) + '#/?';

    Object.keys(settings).forEach(function(setting) {
      if (!isDefault(setting) && setting.indexOf('group') === -1) {
        url += setting + '=' + !defaults[setting] + '&';
      }
    });

    if (!isDefault('groupCutoff')) {
      url += 'groupCutoff=' + settings.groupCutoff + '&';
    }

    Object.keys(settings.groups).forEach(function(groupId) {
      if (settings.groups[groupId] && settings.groups[groupId] !== '0') {
        url += groupId + '-group=' + settings.groups[groupId] + '&';
      }
    });

    return url;
  }

  function setGlobalStatus(status) {
    globalStatus = status;
  }

  function toBodyCssClass() {
    var classes = globalStatus;
    if (settings.animatePage) {
      classes += ' animate-background';
    }
    if (settings.animateHeadings) {
      classes += ' animate-headings';
    }
    return classes;
  }

  function setSettingsfromRouteParams() {
    setDefaultSettings();
    Object.keys($routeParams).forEach(function(routeParam) {
      if (defaults[routeParam] !== undefined) {
        settings[routeParam] = ($routeParams[routeParam] === 'true');
        if (routeParam === 'groupCutoff') {
          settings[routeParam] = $routeParams[routeParam];
        }
      } else {
        settings.groups[routeParam.replace('-group', '')] = $routeParams[routeParam];
      }
    });
  }

  return {
    numberGroups: numberGroups,
    subdomain: subdomain,
    setGlobalStatus: setGlobalStatus,
    settings: settings,
    setDefaultSettings: setDefaultSettings,
    toUrl: toUrl,
    toBodyCssClass: toBodyCssClass,
    setSettingsfromRouteParams: setSettingsfromRouteParams
  };
});
