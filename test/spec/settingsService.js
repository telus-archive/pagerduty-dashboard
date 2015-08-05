util = require('./utilities');

describe('The dashboard settings service', function() {

  beforeEach(function() {
    util.openCustomizePage();
  });

  it('should apply the group cutoff', function() {
    element(by.name('orderCutoff')).sendKeys('1');
    util.clickOpenDashboardButton();
    expect(util.getVisibleGroups().count()).toEqual(0);
  });

  it('should apply a variable sort order', function() {
    var customOrder = 5;
    util.sortOrderInputBoxNames.forEach(function(name) {
      element(by.name(name)).sendKeys(customOrder);
      customOrder -= 1;
    });
    util.clickOpenDashboardButton();

    util.expectVisibleGroupsToEqual([
      util.groupNames.issues,
      util.groupNames.unreliable,
      util.groupNames.unstable,
      util.groupNames.products,
      util.groupNames.stable
    ]);
  });

  it('should apply a constant sort order', function() {
    util.sortOrderInputBoxNames.forEach(function(name) {
      element(by.name(name)).sendKeys('1');
    });
    util.clickOpenDashboardButton();

    util.expectVisibleGroupsToEqual([
      util.groupNames.unreliable,
      util.groupNames.issues,
      util.groupNames.unstable,
      util.groupNames.stable,
      util.groupNames.products
    ]);
  });

  it('should apply the group cutoff with a sort order', function() {
    var sortOrder = [3, 1, 3, 4, 4];

    element(by.name('orderCutoff')).sendKeys('3');
    util.sortOrderInputBoxNames.forEach(function(name, index) {
      element(by.name(name)).sendKeys(sortOrder[index] || 2);
    });
    util.clickOpenDashboardButton();

    util.expectVisibleGroupsToEqual([
      util.groupNames.unreliable,
      util.groupNames.unstable,
      util.groupNames.stable,
      util.groupNames.products
    ]);
  });

  it('should apply the animation settings', function() {});

  /*

  it('can have a flashing background by default', function() {
    dashboardUrl();
    expect(bodyCssClass()).toMatch('animate-background');
  });

  it('should not have a flashing background when disabled', function() {
    dashboardUrl('animatePage=false');
    expect(bodyCssClass()).not.toMatch('animate-background');
  });

  it('can have flashing headers when enabled', function() {
    dashboardUrl('animateHeadings=true');
    expect(bodyCssClass()).toMatch('animate-headings');
  });

  it('should not have flashing headers by default', function() {
    dashboardUrl();
    expect(bodyCssClass()).not.toMatch('animate-headings');
  });

    it('should allow flashing headers on and flashing background off at the same time', function() {
    dashboardUrl('animateHeadings=true&animatePage=false');
    expect(bodyCssClass()).not.toMatch('animate-background');
    expect(bodyCssClass()).toMatch('animate-headings');
  });
  */

  it('should apply the scrolling settings', function() {});

  it('should apply the sound settings', function() {});

  it('should reset the url when a user clicks "reset"', function() {});

  it('should reset the group order when a user clicks "reset order"', function() {});

  it('should reset the sounds when a user clicks "reset sounds"', function() {});
});
