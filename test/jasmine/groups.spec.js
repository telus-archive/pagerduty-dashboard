var expectedGroups = require('./expectedGroups.json');
var mockProvider = require('../mock/mockProvider');
var buildGroups = require('../../server/services/groups');

describe('The group processor', function () {
  it('should generate the groups correctly', function (done) {
    mockProvider.getAll('services', function (e, data) {
      expect(buildGroups(data)).toEqual(expectedGroups);
      done();
    });
  });
});
