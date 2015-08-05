util = require('./utilities');

describe('The dashboard page', function() {

  it('should correctly sort the 5 default mock groups', function() {
    util.openDashboardPage();
    util.expectVisibleGroupsToEqual([
      'UnreliableSite',
      'Other Issues',
      'UnstableSite',
      'StableSite',
      'Other Products'
    ]);
  });

  it('should display a message when there are no groups to display', function() {
    util.openDashboardPage('orderCutoff=1');
    expect(element(by.css('.no-groups')).isDisplayed()).toBeTruthy();
  });

  it('should have a global "critical" state with the default mock data', function() {
    util.openDashboardPage();
    expect(util.getBodyCssClasses()).toMatch('critical');
  });

  it('should have a global "warning" state without the "critical" groups', function() {
    util.openDashboardPage('order-unreliablesite=-1&order-other-issues=-1');
    expect(util.getBodyCssClasses()).toMatch('warning');
    expect(util.getBodyCssClasses()).not.toMatch('critical');
  });

  it('should have 3 groups when "critical" groups are hidden', function() {
    util.openDashboardPage('order-unreliablesite=-1&order-other-issues=-1');
    expect(util.getVisibleGroups().count()).toEqual(3);
  });

  it('should have a global "active" state without the failing groups', function() {
    util.openDashboardPage('order-other-issues=-1&order-unstablesite=-1&order-unreliablesite=-1&');
    expect(util.getBodyCssClasses()).toMatch('active');
    expect(util.getBodyCssClasses()).not.toMatch('critical');
    expect(util.getBodyCssClasses()).not.toMatch('warning');
  });

  it('should have 2 groups without the failing groups', function() {
    util.openDashboardPage('order-other-issues=-1&order-unstablesite=-1&order-unreliablesite=-1&');
    expect(util.getVisibleGroups().count()).toEqual(2);
  });

});
