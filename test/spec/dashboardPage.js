util = require('./utilities');

describe('The dashboard page', function() {

  it('should correctly sort the default mock groups', function() {
    util.openDashboardPage();
    util.expectVisibleGroupsToEqual([
      'UnreliableSite',
      'Other Issues',
      'UnstableSite',
      'StableSite',
      'Other Products',
    ]);
  });

  it('should display a message when there are no groups to display', function() {
    util.openDashboardPage([
      ['orderCutoff', 1]
    ]);
    expect(element(by.css('.no-groups')).isDisplayed()).toBeTruthy();
  });

  it('should have a global "critical" state with the default mock data', function() {
    util.openDashboardPage();
    expect(util.getBodyCssClasses()).toMatch('critical');
  });

  it('should have a global "warning" state without the "critical" groups', function() {
    util.openDashboardPage([
      ['order-unreliablesite', -1],
      ['order-other-issues', -1]
    ]);
    expect(util.getBodyCssClasses()).toMatch('warning');
    expect(util.getBodyCssClasses()).not.toMatch('critical');
  });

  it('should have 3 groups when "critical" groups are hidden', function() {
    util.openDashboardPage([
      ['order-unreliablesite', -1],
      ['order-other-issues', -1]
    ]);
    util.expectVisibleGroupsToEqual([
      'UnstableSite',
      'StableSite',
      'Other Products',
    ]);
  });

  it('should have a global "active" state without the failing groups', function() {
    util.openDashboardPage([
      ['order-other-issues', -1],
      ['order-unstablesite', -1],
      ['order-unreliablesite', -1]
    ]);
    expect(util.getBodyCssClasses()).toMatch('active');
    expect(util.getBodyCssClasses()).not.toMatch('critical');
    expect(util.getBodyCssClasses()).not.toMatch('warning');
  });

  it('should have 2 groups without the failing groups', function() {
    util.openDashboardPage([
      ['order-other-issues', -1],
      ['order-unstablesite', -1],
      ['order-unreliablesite', -1]
    ]);
    util.expectVisibleGroupsToEqual([
      'StableSite',
      'Other Products',
    ]);
  });

  it('should display the correct number of group features', function() {
    util.openDashboardPage();
    [
      ['UnreliableSite', 4],
      ['Other Issues', 3],
      ['UnstableSite', 2],
      ['StableSite', 4],
      ['Other Products', 5],
    ].forEach(function(d) {
      expect(util.getFeaturesFor(d[0]).count()).toEqual(d[1]);
    });
  });

  it('should display the correct number of group services', function() {
    util.openDashboardPage();
    [
      ['UnreliableSite', 4],
      ['Other Issues', 0],
      ['UnstableSite', 3],
      ['StableSite', 6],
      ['Other Products', 0],
    ].forEach(function(d) {
      expect(util.getServicesFor(d[0]).count()).toEqual(d[1]);
    });
  });

  it('should display the site/server for groups that have it', function() {
    util.openDashboardPage();
    [
      'UnreliableSite',
      'UnstableSite',
      'StableSite'
    ].forEach(function(groupName) {
      expect(util.getSiteServerFor(groupName).isDisplayed()).toBeTruthy();
    });
  });

  it('should not display the site/server for groups that do not have it', function() {
    util.openDashboardPage();
    [
      'Other Issues',
      'Other Products'
    ].forEach(function(groupName) {
      expect(util.getSiteServerFor(groupName).isDisplayed()).toBeFalsy();
    });
  });

  it('should have flashing backgrounds enabled by default', function() {
    util.openDashboardPage();
    expect(util.getBodyCssClasses()).toMatch('animate-background');
  });

  it('should not have flashing headers by default', function() {
    util.openDashboardPage();
    expect(util.getBodyCssClasses()).not.toMatch('animate-headings');
  });

  it('should not display a downtime clock for active groups', function() {
    util.openDashboardPage();

    ['StableSite', 'Other Products'].forEach(function(group) {
      expect(util.getDowntimeClockFor(group).isDisplayed()).toBeFalsy();
    });
  });

  it('should display the correct downtime for offline groups', function() {
    util.openDashboardPage();
    var expectedDowntime = Math.round(
      (new Date().getTime() - Date.parse('2014-04-02T07:50:24-07:00')) /
      (1000 * 60 * 60));

    ['UnreliableSite', 'UnstableSite', 'Other Issues'].forEach(function(group) {
      var downTimeClock = util.getDowntimeClockFor(group);
      expect(downTimeClock.isDisplayed()).toBeTruthy();
      downTimeClock.element(by.css('.hours')).getText()
        .then(function(downTime) {
          downTime = parseInt(downTime, 10);
          expect(Math.abs(downTime - expectedDowntime) <= 1).toBeTruthy();
        });
    });
  });
});
