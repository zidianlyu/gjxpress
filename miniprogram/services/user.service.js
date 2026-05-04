const request = require('../utils/request');

function getProfile() {
  return request({ url: '/user/me' });
}

module.exports = { getProfile };
