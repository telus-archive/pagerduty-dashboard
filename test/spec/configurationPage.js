util = require('./utilities');

describe('The customization page', function() {

  beforeEach(function() {
    util.openCustomizePage();
  });

  function changeSomeSettings() {
    element(by.name('animateHeadings')).click();
    element(by.name('animatePage')).click();
    element(by.name('soundsPlay')).click();
    element(by.name('soundsActive')).sendKeys('sounds/warning.mp3');
    util.sortOrderInputBoxNames.forEach(function(name) {
      element(by.name(name)).sendKeys('1');
    });
  }

  it('should display all the groups regardless of the custom sort order', function() {
    util.sortOrderInputBoxNames.forEach(function(name) {
      element(by.name(name)).sendKeys('-1');
    });
    util.clickOpenDashboardButton();
    util.clickSettingsGearButton();
    expect(util.getAllGroups().count()).toEqual(5);
  });

  it('should reset the settings when a user clicks "reset"', function() {
    var defaultUrl = element(by.name('url')).getAttribute('value');

    changeSomeSettings();
    expect(element(by.name('url')).getAttribute('value')).not.toEqual(defaultUrl);

    element(by.name('reset')).click();
    expect(element(by.name('url')).getAttribute('value')).toEqual(defaultUrl);
    expect(element(by.name('animateHeadings')).isSelected()).toBe(false);
    expect(element(by.name('animatePage')).isSelected()).toBe(true);
    expect(element(by.name('soundsPlay')).isSelected()).toBe(false);
    expect(element(by.name('soundsActive')).getAttribute('value')).toEqual('');
    util.sortOrderInputBoxNames.forEach(function(name) {
      expect(element(by.name(name)).getAttribute('value')).toEqual('');
    });
  });

  it('should reset the group order when a user clicks "reset order"', function() {
    changeSomeSettings();
    element(by.name('resetGroupOrder')).click();

    util.sortOrderInputBoxNames.forEach(function(name) {
      expect(element(by.name(name)).getAttribute('value')).toEqual('');
    });
    // and leave the rest alone
    expect(element(by.name('animateHeadings')).isSelected()).toBe(true);
    expect(element(by.name('animatePage')).isSelected()).toBe(false);
    expect(element(by.name('soundsPlay')).isSelected()).toBe(true);
    expect(element(by.name('soundsActive')).getAttribute('value')).toEqual('sounds/warning.mp3');

  });

  it('should reset the sounds when a user clicks "reset sounds"', function() {
    changeSomeSettings();
    element(by.name('resetSounds')).click();

    expect(element(by.name('soundsActive')).getAttribute('value')).toEqual('');
    // and leave the rest alone
    util.sortOrderInputBoxNames.forEach(function(name) {
      expect(element(by.name(name)).getAttribute('value')).toEqual('1');
    });
    expect(element(by.name('soundsPlay')).isSelected()).toBe(true);
    expect(element(by.name('animateHeadings')).isSelected()).toBe(true);
    expect(element(by.name('animatePage')).isSelected()).toBe(false);
  });

  it('should correctly link the "open" button', function() {
    var shownUrl = element(by.name('url')).getAttribute('value');
    expect(element(by.name('open')).getAttribute('href')).toEqual(shownUrl);

    changeSomeSettings();

    shownUrl = element(by.name('url')).getAttribute('value');
    expect(element(by.name('open')).getAttribute('href')).toEqual(shownUrl);
  });

  it('should update the url based off the settings', function() {
    changeSomeSettings();
    var shownUrl = element(by.name('url')).getAttribute('value');

    expect(shownUrl).toMatch(/\?animateHeadings=true&animatePage=false&soundsPlay=true&soundsActive=sounds%2Fwarning\.mp3&/);
  });

  it('should persist the setting state after leaving and returning', function() {
    changeSomeSettings();
    util.clickOpenDashboardButton();
    util.clickSettingsGearButton();

    util.sortOrderInputBoxNames.forEach(function(name) {
      expect(element(by.name(name)).getAttribute('value')).toEqual('1');
    });
    expect(element(by.name('animateHeadings')).isSelected()).toBe(true);
    expect(element(by.name('animatePage')).isSelected()).toBe(false);
    expect(element(by.name('soundsPlay')).isSelected()).toBe(true);
    expect(element(by.name('soundsActive')).getAttribute('value')).toEqual('sounds/warning.mp3');
  });
});
