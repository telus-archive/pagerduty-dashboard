// service for setting and recalling user display settings
module.exports = function ($routeParams, $location) {
  var settings = {};
  var listeners = [];

  // note: do not prefix any property with "order-"
  // that prefix is used for registering the group ordering properties
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

  // load the default settings on initialization
  setDefaultSettings();
  function setDefaultSettings () {
    resetGroupOrder();
    Object.keys(defaults).forEach(function (setting) {
      settings[setting] = defaults[setting];
    });
  }

  // look for all "order-" keys and reset them
  function resetGroupOrder () {
    Object.keys(settings).forEach(function (setting) {
      if (setting.indexOf('order-') === 0) {
        settings[setting] = undefined;
      }
    });
  }

  // setting sounds to the empty string makes audioNotifications use the defaults
  function resetSounds () {
    settings.soundsActive = '';
    settings.soundsWarning = '';
    settings.soundsCritical = '';
  }

  // is a particular setting using the default value
  function isDefault (setting) {
    var value = parseValue(settings[setting]);
    return value === defaults[setting] || value === '';
  }

  // take the current settings and encode them in a URL for bookmarking
  function toUrl () {
    var url = $location.absUrl();
    url = url.substring(0, url.indexOf('#')) + '#/?';

    Object.keys(settings).forEach(function (setting) {
      if (!isDefault(setting)) {
        // only encode non-default settings
        url += setting + '=' + encodeParam(settings[setting]) + '&';
      }
    });

    return url;
  }

  // convert a value into a URI/URL friendly format
  function encodeParam (value) {
    return encodeURIComponent(value);
  }

  // retrieve a value from an URI/URL
  function decodeParam (value) {
    return parseValue(decodeURIComponent(value));
  }

  // attempt to parse a value as a boolean, a number, or a string
  function parseValue (value) {
    if (value === 'true') {
      return true;
    }
    if (value === 'false') {
      return false;
    }
    var numberValue = parseInt(value, 10);
    if (numberValue || numberValue === 0) {
      return numberValue;
    }
    return value;
  }

  // extract the settings from the current URL and apply them
  function setSettingsfromRouteParams () {
    setDefaultSettings();
    Object.keys($routeParams).forEach(function (routeParam) {
      settings[routeParam] = decodeParam($routeParams[routeParam]);
    });
    notifySettingChange();
  }

  // get the value of a particular setting
  function getValue (value) {
    return settings[value];
  }

  // get the order value for a particular group
  function getGroupOrder (groupId) {
    return settings['order-' + groupId] || 0;
  }

  // let any registered listeners know that the user has changed some settings
  function notifySettingChange () {
    listeners.forEach(function (listener) {
      listener();
    });
  }

  // allow other modules to register themselves as listeners to setting changes
  function onUpdate (listener) {
    listeners.push(listener);
    listener();
  }

  return {
    resetGroupOrder: resetGroupOrder,
    resetSounds: resetSounds,
    settings: settings,
    getValue: getValue,
    getGroupOrder: getGroupOrder,
    setDefaultSettings: setDefaultSettings,
    toUrl: toUrl,
    setSettingsfromRouteParams: setSettingsfromRouteParams,
    onUpdate: onUpdate
  };
};
