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
    expect(util.getVisibleGroups().count()).toEqual(3);
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
    expect(util.getVisibleGroups().count()).toEqual(2);
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
