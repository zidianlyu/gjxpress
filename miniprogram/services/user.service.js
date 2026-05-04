const { request } = require('../utils/request');

/**
 * 获取用户信息
 * GET /user/me
 */
function getProfile() {
  return request({
    url: '/user/me',
    method: 'GET',
  });
}

module.exports = {
  getProfile,
};
