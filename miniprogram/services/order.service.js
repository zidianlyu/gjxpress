const { request } = require('../utils/request');

/**
 * 获取订单列表
 * GET /orders
 */
function getOrders(params = {}) {
  return request({
    url: '/orders',
    method: 'GET',
    data: params,
  });
}

/**
 * 获取订单详情
 * GET /orders/:id
 */
function getOrderById(id) {
  return request({
    url: `/orders/${id}`,
    method: 'GET',
  });
}

/**
 * 获取订单物流信息
 * GET /orders/:id/shipment
 */
function getOrderShipment(orderId) {
  return request({
    url: `/orders/${orderId}/shipment`,
    method: 'GET',
  });
}

module.exports = {
  getOrders,
  getOrderById,
  getOrderShipment,
  // 兼容性导出
  getOrderDetail: getOrderById,
};
