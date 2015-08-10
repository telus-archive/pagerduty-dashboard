function getVisibleGroups() {
  return element.all(by.css('.groups .group'));
}

function getVisibleGroup(name) {
  return getVisibleGroups().filter(function(el) {
    return el.getAttribute('name').then(function(n) {
      return n === name;
    });
  }).first();
}

module.exports = {
  clickOpenDashboardButton: function() {
    element(by.name('open')).click();
  },
  openCustomizePage: function() {
    browser.get('http://localhost:3000/dashboards/pagerduty/#/customize');
  },
  getVisibleGroups: getVisibleGroups,
  getVisibleGroup: getVisibleGroup,
  getAllGroups: function() {
    return element.all(by.repeater('group in data.groups'));
  },
  sortOrderInputBoxNames: [
    'order-other-products',
    'order-other-issues',
    'order-stablesite',
    'order-unstablesite',
    'order-unreliablesite'
  ],
  expectVisibleGroupsToEqual: function(expectedGroups) {
    getVisibleGroups().getAttribute('name').then(function(groups) {
      expect(groups).toEqual(expectedGroups);
    });
  },
  clickSettingsGearButton: function() {
    element(by.css('.customize-link')).click();
  },
  openDashboardPage: function(params) {
    params = params || [];
    url = 'http://localhost:3000/dashboards/pagerduty/#/?';
    params.forEach(function(param) {
      url += param[0] + '=' + param[1] + '&';
    });
    browser.get(url);
  },
  getDowntimeClockFor: function(groupName) {
    return getVisibleGroup(groupName).element(by.css('.downtime'));
  },
  getBodyCssClasses: function() {
    return element(by.tagName('body')).getAttribute('class');
  }
};
