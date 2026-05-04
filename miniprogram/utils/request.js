const { API_BASE_URL } = require('../config/index');
const storage = require('./storage');
const auth = require('./auth');

function request(options) {
  const token = storage.getToken();

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.header || {}),
      },
      success: async (res) => {
        if (res.statusCode === 401 && !options.__retried) {
          try {
            await auth.login();
            const retried = await request({ ...options, __retried: true });
            resolve(retried);
          } catch (err) {
            reject(err);
          }
          return;
        }

        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (res.data.success !== false) {
            resolve(res.data);
          } else {
            reject({
              statusCode: res.statusCode,
              data: res.data,
              error: res.data.error,
            });
          }
        } else {
          reject({
            statusCode: res.statusCode,
            data: res.data,
          });
        }
      },
      fail: (err) => {
        reject({
          isNetworkError: true,
          errMsg: err.errMsg || '网络请求失败',
        });
      },
    });
  });
}

module.exports = request;
