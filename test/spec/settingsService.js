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
      'Other Issues',
      'UnreliableSite',
      'UnstableSite',
      'Other Products',
      'StableSite'
    ]);
  });

  it('should apply a constant sort order', function() {
    util.sortOrderInputBoxNames.forEach(function(name) {
      element(by.name(name)).sendKeys('1');
    });
    util.clickOpenDashboardButton();

    util.expectVisibleGroupsToEqual([
      'UnreliableSite',
      'Other Issues',
      'UnstableSite',
      'StableSite',
      'Other Products'
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
      'UnreliableSite',
      'UnstableSite',
      'StableSite',
      'Other Products'
    ]);
  });

  it('should apply a plain background if flashing is disabled', function() {
    element(by.name('animatePage')).click();

    util.clickOpenDashboardButton();
    expect(util.getBodyCssClasses()).not.toMatch('animate-background');
  });

  it('should apply flashing headers if enabled', function() {
    element(by.name('animateHeadings')).click();

    util.clickOpenDashboardButton();
    expect(util.getBodyCssClasses()).toMatch('animate-headings');
  });

  it('should allow flashing headers on and flashing background off at the same time', function() {
    element(by.name('animateHeadings')).click();
    element(by.name('animatePage')).click();

    util.clickOpenDashboardButton();
    expect(util.getBodyCssClasses()).toMatch('animate-headings');
    expect(util.getBodyCssClasses()).not.toMatch('animate-background');
  });

  it('should apply the scrolling settings', function() {
    element(by.name('scrollHideBar')).click();

    util.clickOpenDashboardButton();
    expect(util.getBodyCssClasses()).toMatch('hide-scroll-bar');
  });

  it('should apply the single column setting', function() {
    element(by.name('multiColumn')).click();

    util.clickOpenDashboardButton();
    expect(util.getBodyCssClasses()).toMatch('single-column');
  });

});
