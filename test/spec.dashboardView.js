describe('Dashboard View', function() {
  var URL = 'http://localhost:3000/dashboards/pagerduty/#/?';

  it('should have the 5 mock groups by default', function() {
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

  it('should display a message when there are no groups to display', function() {
    browser.get(URL + 'orderCutoff=1');

    expect(element(by.css('.no-groups')).isDisplayed()).toBeTruthy();
  });

});
