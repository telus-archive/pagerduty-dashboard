describe('Dashboard View', function() {

  it('should have 5 groups by default mock data', function() {
    getUrl();
    expect(groupRepeater().count()).toEqual(5);
  });

  it('should display no groups when the cutoff is too high', function() {
    getUrl('orderCutoff=1');
    expect(groupRepeater().count()).toEqual(0);
  });

  it('should display a message when there are no groups', function() {
    getUrl('orderCutoff=1');
    expect(element(by.css('.no-groups')).isDisplayed()).toBeTruthy();
  });

  it('can have a flashing background by default', function() {
    getUrl();
    expect(bodyCssClass()).toMatch('animate-background');
  });

  it('should not have a flashing background when disabled', function() {
    getUrl('animatePage=false');
    expect(bodyCssClass()).not.toMatch('animate-background');
  });

  it('can have flashing headers when enabled', function() {
    getUrl('animateHeadings=true');
    expect(bodyCssClass()).toMatch('animate-headings');
  });

  it('should not have flashing headers by default', function() {
    getUrl();
    expect(bodyCssClass()).not.toMatch('animate-headings');
  });

  it('should allow flashing headers on and flashing background off at the same time', function() {
    getUrl('animateHeadings=true&animatePage=false');
    expect(bodyCssClass()).not.toMatch('animate-background');
    expect(bodyCssClass()).toMatch('animate-headings');
  });

  it('should have a global "critical" state by default mock data', function() {
    getUrl();
    expect(bodyCssClass()).toMatch('critical');
  });

  it('should have a global "warning" state when the mock "critical" services are hidden', function() {
    getUrl('order-unreliablesite=-1&order-other-issues=-1');
    expect(bodyCssClass()).toMatch('warning');
    expect(bodyCssClass()).not.toMatch('critical');
  });

  it('should have 3 groups when the mock "critical" services are hidden', function() {
    getUrl('order-unreliablesite=-1&order-other-issues=-1');
    expect(groupRepeater().count()).toEqual(3);
  });

  it('should have a global "active" state when the failing services are hidden', function() {
    getUrl('order-other-issues=-1&order-unstablesite=-1&order-unreliablesite=-1&');
    expect(bodyCssClass()).toMatch('active');
    expect(bodyCssClass()).not.toMatch('critical');
    expect(bodyCssClass()).not.toMatch('warning');
  });

  it('should have 2 groups when the mock "critical" & "warning" services are hidden', function() {
    getUrl('order-other-issues=-1&order-unstablesite=-1&order-unreliablesite=-1&');
    expect(groupRepeater().count()).toEqual(2);
  });

  it('should correctly sort the default mock groups', function() {
    getUrl();
    expect(bodyCssClass()).not.toMatch('animate-headings');
  });

  // ordering

});

function bodyCssClass() {
  return element(by.tagName('body')).getAttribute('class');
}

function groupRepeater() {
  return element.all(by.repeater('group in groups'));
}

function getUrl(append) {
  browser.get('http://localhost:3000/dashboards/pagerduty/#/?' + (append || ''));
}
