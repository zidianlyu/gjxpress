const { API_BASE_URL } = require('../config/index');

// Storage keys
const TOKEN_KEY = 'accessToken';
const USER_KEY = 'currentUser';

/**
 * 获取微信登录 code
 */
function wxLoginCode() {
  return new Promise((resolve, reject) => {
    let isResolved = false;

    wx.login({
      timeout: 10000,
      success(res) {
        if (isResolved) return;
        isResolved = true;
        if (res.code) resolve(res.code);
        else reject(new Error('微信登录失败，未获取到 code'));
      },
      fail: (err) => {
        if (isResolved) return;
        isResolved = true;
        reject(new Error(err.errMsg || '微信登录失败'));
      },
      complete: () => {
        // Ensure promise resolves even if wx.login hangs
        setTimeout(() => {
          if (!isResolved) {
            isResolved = true;
            reject(new Error('微信登录超时'));
          }
        }, 12000);
      },
    });
  });
}

/**
 * 登录
 * 流程：wx.login → POST /auth/wechat-login → 保存 token 和 user
 * @param {Object} options - 可选参数
 * @param {string} options.nickname - 用户昵称（可选）
 * @param {string} options.avatarUrl - 用户头像（可选）
 */
async function login(options = {}) {
  const code = await wxLoginCode();

  return new Promise((resolve, reject) => {
    let isResolved = false;

    wx.request({
      url: `${API_BASE_URL}/auth/wechat-login`,
      method: 'POST',
      data: {
        code,
        nickname: options.nickname || undefined,
        avatarUrl: options.avatarUrl || undefined,
      },
      header: { 'Content-Type': 'application/json' },
      timeout: 10000,
      success(res) {
        if (isResolved) return;
        isResolved = true;
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // 处理后端返回格式
          const responseData = res.data.data || res.data;
          const { accessToken, user } = responseData;

          if (!accessToken || !user) {
            reject(new Error('登录响应格式错误'));
            return;
          }

          // 保存到本地存储
          wx.setStorageSync(TOKEN_KEY, accessToken);
          wx.setStorageSync(USER_KEY, user);

          // 更新全局数据
          const app = getApp();
          if (app) {
            app.globalData.token = accessToken;
            app.globalData.userInfo = user;
          }

          resolve({ accessToken, user });
        } else {
          const message = res.data?.message || res.data?.error || '登录失败';
          wx.showToast({
            title: message,
            icon: 'none',
            duration: 2000,
          });
          reject(new Error(message));
        }
      },
      fail: (err) => {
        if (isResolved) return;
        isResolved = true;
        const message = err.errMsg || '网络请求失败，请检查网络';
        wx.showToast({
          title: message,
          icon: 'none',
          duration: 2000,
        });
        reject(new Error(message));
      },
      complete: () => {
        // Failsafe: ensure promise resolves after 12s
        setTimeout(() => {
          if (!isResolved) {
            isResolved = true;
            reject(new Error('登录请求超时'));
          }
        }, 12000);
      },
    });
  });
}

/**
 * 获取用户信息
 * GET /user/me
 */
async function getUserProfile() {
  const token = wx.getStorageSync(TOKEN_KEY);

  if (!token) {
    return Promise.reject(new Error('未登录'));
  }

  return new Promise((resolve, reject) => {
    let isResolved = false;

    wx.request({
      url: `${API_BASE_URL}/user/me`,
      method: 'GET',
      header: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
      success(res) {
        if (isResolved) return;
        isResolved = true;
        if (res.statusCode === 200) {
          const user = res.data.data || res.data;
          wx.setStorageSync(USER_KEY, user);

          const app = getApp();
          if (app) {
            app.globalData.userInfo = user;
          }

          resolve(user);
        } else if (res.statusCode === 401) {
          clearAuth();
          wx.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none',
          });
          reject(new Error('登录已过期'));
        } else {
          const message = res.data?.message || '获取用户信息失败';
          reject(new Error(message));
        }
      },
      fail: (err) => {
        if (isResolved) return;
        isResolved = true;
        reject(new Error(err.errMsg || '网络请求失败'));
      },
      complete: () => {
        // Failsafe: ensure promise resolves after 12s
        setTimeout(() => {
          if (!isResolved) {
            isResolved = true;
            reject(new Error('获取用户信息超时'));
          }
        }, 12000);
      },
    });
  });
}

/**
 * 确保已登录
 * 如果有 token，直接返回；否则执行登录
 */
function ensureLogin() {
  const token = wx.getStorageSync(TOKEN_KEY);
  const user = wx.getStorageSync(USER_KEY);

  if (token && user) {
    // 更新全局数据
    const app = getApp();
    if (app) {
      app.globalData.token = token;
      app.globalData.userInfo = user;
    }
    return Promise.resolve({ accessToken: token, user });
  }

  return login();
}

/**
 * 清除登录状态
 */
function clearAuth() {
  wx.removeStorageSync(TOKEN_KEY);
  wx.removeStorageSync(USER_KEY);

  const app = getApp();
  if (app) {
    app.globalData.token = null;
    app.globalData.userInfo = null;
  }
}

/**
 * 退出登录
 */
function logout() {
  clearAuth();
  wx.showToast({
    title: '已退出登录',
    icon: 'success',
  });
}

/**
 * 检查是否已登录
 */
function isLoggedIn() {
  const token = wx.getStorageSync(TOKEN_KEY);
  return !!token;
}

/**
 * 获取当前用户
 */
function getCurrentUser() {
  return wx.getStorageSync(USER_KEY);
}

/**
 * 获取 token
 */
function getToken() {
  return wx.getStorageSync(TOKEN_KEY);
}

module.exports = {
  login,
  ensureLogin,
  logout,
  getUserProfile,
  wxLoginCode,
  isLoggedIn,
  getCurrentUser,
  getToken,
  clearAuth,
};
