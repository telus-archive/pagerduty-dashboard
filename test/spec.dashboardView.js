describe('Dashboard View', function() {

  it('should correctly sort the 5 default mock groups', function() {
    dashboardUrl();
    groupRepeater().all(by.css('h2 span')).getText().then(function(groups) {
      expect(groups).toEqual([
        'UnreliableSite',
        'Other Issues',
        'UnstableSite',
        'StableSite',
        'Other Products'
      ]);
    });
  });

  it('should display no groups when the cutoff is too high', function() {
    dashboardUrl('orderCutoff=1');
    expect(groupRepeater().count()).toEqual(0);
  });

  it('should display a message when there are no groups', function() {
    dashboardUrl('orderCutoff=1');
    expect(element(by.css('.no-groups')).isDisplayed()).toBeTruthy();
  });

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

  it('should have a global "critical" state by default mock data', function() {
    dashboardUrl();
    expect(bodyCssClass()).toMatch('critical');
  });

  it('should have a global "warning" state when the mock "critical" services are hidden', function() {
    dashboardUrl('order-unreliablesite=-1&order-other-issues=-1');
    expect(bodyCssClass()).toMatch('warning');
    expect(bodyCssClass()).not.toMatch('critical');
  });

  it('should have 3 groups when the mock "critical" services are hidden', function() {
    dashboardUrl('order-unreliablesite=-1&order-other-issues=-1');
    expect(groupRepeater().count()).toEqual(3);
  });

  it('should have a global "active" state when the failing services are hidden', function() {
    dashboardUrl('order-other-issues=-1&order-unstablesite=-1&order-unreliablesite=-1&');
    expect(bodyCssClass()).toMatch('active');
    expect(bodyCssClass()).not.toMatch('critical');
    expect(bodyCssClass()).not.toMatch('warning');
  });

  it('should have 2 groups when the mock "critical" & "warning" services are hidden', function() {
    dashboardUrl('order-other-issues=-1&order-unstablesite=-1&order-unreliablesite=-1&');
    expect(groupRepeater().count()).toEqual(2);
  });

});

function bodyCssClass() {
  return element(by.tagName('body')).getAttribute('class');
}

function groupRepeater() {
  return element.all(by.repeater('group in groups'));
}

function dashboardUrl(append) {
  browser.get('http://localhost:3000/dashboards/pagerduty/#/?' + (append || ''));
}
