function getGroupElement (groupName) {
  return element.all(by.name(groupName)).filter(function (el) {
    return el.isDisplayed().then(function (isDisplayed) {
      return isDisplayed;
    });
  }).first();
}

module.exports = {
  clickOpenDashboardButton: function () {
    element(by.name('open')).click();
  },
  openCustomizePage: function () {
    browser.get('http://localhost:3000/dashboards/pagerduty/#/customize');
  },
  getAllGroups: function () {
    return element.all(by.repeater('group in data.groups'));
  },
  sortOrderInputBoxNames: [
    'order-other-products',
    'order-other-issues',
    'order-stablesite',
    'order-unstablesite',
    'order-unreliablesite'
  ],
  expectVisibleGroupsToEqual: function (expectedGroups) {
    element.all(by.css('.groups .group')).getAttribute('name')
      .then(function (groups) {
        expect(groups).toEqual(expectedGroups);
      });
  },
  clickSettingsGearButton: function () {
    element(by.css('.customize-link')).click();
  },
  openDashboardPage: function (params) {
    params = params || [];
    var url = 'http://localhost:3000/dashboards/pagerduty/#/?';
    params.forEach(function (param) {
      url += param[0] + '=' + param[1] + '&';
    });
    browser.get(url);
  },
  getDowntimeClockFor: function (groupName) {
    return getGroupElement(groupName).element(by.css('.downtime'));
  },
  getBodyCssClasses: function () {
    return element(by.tagName('body')).getAttribute('class');
  },
  getServicesFor: function (groupName) {
    return getGroupElement(groupName)
      .all(by.repeater('service in group.dependencies'));
  },
  getFeaturesFor: function (groupName) {
    return getGroupElement(groupName)
      .all(by.repeater('service in group.features'));
  },
  getSiteServerFor: function (groupName) {
    return getGroupElement(groupName).element(by.css('.serversite'));
  }
};
