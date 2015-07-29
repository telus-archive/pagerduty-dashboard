describe('Dashboard View', function() {
  var URL = 'http://localhost:3000/dashboards/pagerduty/#/?';

  it('should have 5 groups by default mock data', function() {
    browser.get(URL);
    element.all(by.css('.group')).then(function(items) {
      expect(items.length).toBe(5);
    });
  });

  it('should display no groups when the cutoff is too high', function() {
    browser.get(URL + 'orderCutoff=1');
    element.all(by.css('.group')).then(function(items) {
      expect(items.length).toBe(0);
    });
  });

  it('should display a message when there are no groups', function() {
    browser.get(URL + 'orderCutoff=1');
    expect(element(by.css('.no-groups')).isDisplayed()).toBeTruthy();
  });

  it('can have a flashing background by default', function() {
    browser.get(URL);
    expect(element(by.tagName('body')).getAttribute('class')).toMatch('animate-background');
  });

  it('should not have a flashing background when disabled', function() {
    browser.get(URL + 'animatePage=false');
    expect(element(by.tagName('body')).getAttribute('class')).not.toMatch('animate-background');
  });

  it('can have flashing headers when enabled', function() {
    browser.get(URL + 'animateHeadings=true');
    expect(element(by.tagName('body')).getAttribute('class')).toMatch('animate-headings');
  });

  it('should not have flashing headers by default', function() {
    browser.get(URL);
    expect(element(by.tagName('body')).getAttribute('class')).not.toMatch('animate-headings');
  });

  it('should allow flashing headers on and flashing background off at the same time', function() {
    browser.get(URL + 'animateHeadings=true&animatePage=false');
    var classes = element(by.tagName('body')).getAttribute('class');
    expect(classes).not.toMatch('animate-background');
    expect(classes).toMatch('animate-headings');
  });

  it('should have a global "critical" state by default mock data', function() {
    browser.get(URL);
    expect(element(by.tagName('body')).getAttribute('class')).toMatch('critical');
  });

  it('should have a global "warning" state when the mock "critical" services are hidden', function() {
    browser.get(URL + 'animateHeadings=true&animatePage=false&order-unreliablesite=-1&order-other-issues=-1');
    expect(element(by.tagName('body')).getAttribute('class')).toMatch('warning');
  });


  // ordering

});
