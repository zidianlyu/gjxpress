const request = require('../utils/request');

function getOrders(params = {}) {
  return request({
    url: '/orders',
    method: 'GET',
    data: params,
  });
}

function getOrderDetail(id) {
  return request({
    url: `/orders/${id}`,
    method: 'GET',
  });
}

function getOrderShipment(orderId) {
  return request({
    url: `/orders/${orderId}/shipment`,
    method: 'GET',
  });
}

module.exports = {
  getOrders,
  getOrderDetail,
  getOrderShipment,
};
