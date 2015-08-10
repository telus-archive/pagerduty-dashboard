function getVisibleGroups() {
  return element.all(by.css('.groups .group'));
}

module.exports = {
  clickOpenDashboardButton: function() {
    element(by.name('open')).click();
  },
  openCustomizePage: function() {
    browser.get('http://localhost:3000/dashboards/pagerduty/#/customize');
  },
  groupNameFor: {
    unreliable: 'UnreliableSite',
    issues: 'Other Issues',
    unstable: 'UnstableSite',
    stable: 'StableSite',
    products: 'Other Products'
  },
  getVisibleGroups: getVisibleGroups,
  getVisibleGroup: function(name) {
    return getVisibleGroups().filter(function(el) {
      return el.getAttribute('name').then(function(n) {
        return n === name;
      });
    }).first();
  },
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
  openDashboardPage: function(append) {
    browser.get('http://localhost:3000/dashboards/pagerduty/#/?' + (append || ''));
  },
  getBodyCssClasses: function() {
    return element(by.tagName('body')).getAttribute('class');
  }
};
