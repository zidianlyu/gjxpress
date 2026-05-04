const { request } = require('../utils/request');

/**
 * 确认包裹
 * POST /packages/:id/confirm
 */
function confirmPackage(packageId, data = {}) {
  return request({
    url: `/packages/${packageId}/confirm`,
    method: 'POST',
    data,
  });
}

/**
 * 提交包裹问题/异常
 * POST /packages/:id/issue
 * @param {string} packageId - 包裹ID
 * @param {string|Object} data - 问题描述字符串或包含 type/description 的对象
 */
function reportPackageIssue(packageId, data) {
  const payload = typeof data === 'string'
    ? { type: 'OTHER', description: data }
    : { type: data.type || 'OTHER', description: data.description };

  return request({
    url: `/packages/${packageId}/issue`,
    method: 'POST',
    data: payload,
  });
}

module.exports = {
  confirmPackage,
  reportPackageIssue,
};
