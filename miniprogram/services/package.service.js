const request = require('../utils/request');

function confirmPackage(packageId, data = {}) {
  return request({
    url: `/packages/${packageId}/confirm`,
    method: 'POST',
    data,
  });
}

function reportPackageIssue(packageId, data) {
  return request({
    url: `/packages/${packageId}/issue`,
    method: 'POST',
    data,
  });
}

module.exports = {
  confirmPackage,
  reportPackageIssue,
};
