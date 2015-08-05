util = require('./utilities');

describe('The customization page', function() {

  beforeEach(function() {
    util.openCustomizePage();
  });

  it('should always display 5 groups regardless of the sort order', function() {
    util.sortOrderInputBoxNames.forEach(function(name) {
      element(by.name(name)).sendKeys('-1');
    });
    util.clickOpenDashboardButton();
    util.clickSettingsGearButton();
    expect(util.getAllGroups().count()).toEqual(5);
  });

  // test switching back and forth and settings being applied
  //check url contains

  //check settings persist
});
