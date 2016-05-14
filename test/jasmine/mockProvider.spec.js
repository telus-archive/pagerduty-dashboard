var mockProvider = require('../mock/mockProvider');
var expectedServices = require('./expectedServices');

describe('The mockProvider', function () {
  it('should generate the services correctly', function (done) {
    mockProvider.getAll('services', function (e, data) {
      expect(data).toEqual(expectedServices);
      done();
    });
  });
});
