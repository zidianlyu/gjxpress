const request = require('../utils/request');

function getWarehouseAddress() {
  return request({ url: '/warehouse-address/current' });
}

module.exports = { getWarehouseAddress };
