app.factory('dashboardSettings', function($routeParams, $location) {
  var settings = {};
  var listeners = [];

  // do not prefix any property with "order-"
  var defaults = {
    orderCutoff: 0,

    animateHeadings: false,
    animatePage: true,
    animateWarnings: false,

    scrollHideBar: false,
    scrollGoToTop: true,

    soundsPlay: false,
    soundsActive: '',
    soundsWarning: '',
    soundsCritical: ''
  };

  setDefaultSettings();

  function setDefaultSettings() {
    resetGroupOrder();
    Object.keys(defaults).forEach(function(setting) {
      settings[setting] = defaults[setting];
    });
  }

  function resetGroupOrder() {
    Object.keys(settings).forEach(function(setting) {
      if (setting.indexOf('order-') === 0) {
        settings[setting] = undefined;
      }
    });
  }

  function isDefault(setting) {
    var value = parseValue(settings[setting]);
    return value === defaults[setting] || value === '';
  }

  function toUrl() {
    var url = $location.absUrl();
    url = url.substring(0, url.indexOf('#')) + '#/?';

    Object.keys(settings).forEach(function(setting) {
      if (!isDefault(setting)) {
        url += setting + '=' + encodeParam(settings[setting]) + '&';
      }
    });

    return url;
  }

  function encodeParam(value) {
    return encodeURIComponent(value);
  }

  function decodeParam(value) {
    return parseValue(decodeURIComponent(value));
  }

  function parseValue(value) {
    if (value === 'true') {
      return true;
    }
    if (value === 'false') {
      return false;
    }
    var numberValue = parseInt(value);
    if (numberValue || numberValue === 0) {
      return numberValue;
    }
    return value;
  }

  function setSettingsfromRouteParams() {
    setDefaultSettings();
    Object.keys($routeParams).forEach(function(routeParam) {
      settings[routeParam] = decodeParam($routeParams[routeParam]);
    });
    notifySettingChange();
  }

  function getValue(value) {
    return settings[value];
  }

  function getGroupOrder(groupId) {
    return settings['order-' + groupId] || 0;
  }

  function notifySettingChange() {
    listeners.forEach(function(listener) {
      listener();
    });
  }

  function onSettingChange(listener) {
    listeners.push(listener);
    listener();
  }

  return {
    resetGroupOrder: resetGroupOrder,
    settings: settings,
    getValue: getValue,
    getGroupOrder: getGroupOrder,
    setDefaultSettings: setDefaultSettings,
    toUrl: toUrl,
    setSettingsfromRouteParams: setSettingsfromRouteParams,
    onUpdate: onSettingChange
  };
});
