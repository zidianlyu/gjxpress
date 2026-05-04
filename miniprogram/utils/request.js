const { API_BASE_URL } = require('../config/index');
const auth = require('./auth');

// Token storage key
const TOKEN_KEY = 'accessToken';

/**
 * 获取存储的 token
 */
function getToken() {
  return wx.getStorageSync(TOKEN_KEY);
}

/**
 * 设置 token
 */
function setToken(token) {
  wx.setStorageSync(TOKEN_KEY, token);
}

/**
 * 清除 token
 */
function clearToken() {
  wx.removeStorageSync(TOKEN_KEY);
}

/**
 * 统一错误处理
 */
function handleError(err, showToast = true) {
  let message = '请求失败';

  if (err.isNetworkError) {
    message = err.errMsg || '网络连接失败，请检查网络';
  } else if (err.statusCode === 401) {
    message = '登录已过期，请重新登录';
  } else if (err.statusCode === 403) {
    message = '无权访问此资源';
  } else if (err.statusCode === 404) {
    message = '请求的资源不存在';
  } else if (err.statusCode === 400) {
    message = err.data?.message || '请求参数错误';
  } else if (err.statusCode >= 500) {
    message = '服务器错误，请稍后重试';
  } else if (err.data?.message) {
    message = err.data.message;
  }

  if (showToast) {
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2000,
    });
  }

  return { ...err, message };
}

/**
 * 请求封装
 * @param {Object} options
 * @param {string} options.url - 请求路径（不含 baseURL）
 * @param {string} options.method - 请求方法 GET/POST/PATCH/DELETE
 * @param {Object} options.data - 请求数据
 * @param {Object} options.header - 自定义 header
 * @param {boolean} options.showToast - 是否显示错误 toast，默认 true
 * @returns {Promise}
 */
function request(options) {
  const token = getToken();
  const showToast = options.showToast !== false;

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
        // 处理 401 - Token 过期
        if (res.statusCode === 401 && !options.__retried) {
          try {
            clearToken();
            await auth.login();
            const retried = await request({ ...options, __retried: true, showToast: false });
            resolve(retried);
          } catch (err) {
            const error = handleError({ statusCode: 401, message: '登录已过期，请重新登录' }, showToast);
            reject(error);
          }
          return;
        }

        // 处理成功响应
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // 后端返回格式: { success: true, data: ..., message: ... }
          if (res.data && res.data.success === false) {
            const error = handleError({
              statusCode: res.statusCode,
              data: res.data,
              message: res.data.message || '请求失败',
            }, showToast);
            reject(error);
          } else {
            resolve(res.data);
          }
        } else {
          // 处理错误响应
          const error = handleError({
            statusCode: res.statusCode,
            data: res.data,
          }, showToast);
          reject(error);
        }
      },
      fail: (err) => {
        const error = handleError({
          isNetworkError: true,
          errMsg: err.errMsg || '网络请求失败',
        }, showToast);
        reject(error);
      },
    });
  });
}

module.exports = {
  request,
  getToken,
  setToken,
  clearToken,
};

