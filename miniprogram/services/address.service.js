const { request } = require('../utils/request');

/**
 * 获取仓库地址
 * GET /warehouse-address
 */
function getWarehouseAddress() {
  return request({
    url: '/warehouse-address',
    method: 'GET',
  });
}

module.exports = {
  getWarehouseAddress,
};
