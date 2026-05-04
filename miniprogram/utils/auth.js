const storage = require('./storage');
const { API_BASE_URL } = require('../config/index');

function wxLoginCode() {
  return new Promise((resolve, reject) => {
    wx.login({
      success(res) {
        if (res.code) resolve(res.code);
        else reject(new Error('wx.login did not return code'));
      },
      fail: reject,
    });
  });
}

async function login() {
  const code = await wxLoginCode();

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE_URL}/auth/wechat-login`,
      method: 'POST',
      data: { code },
      header: { 'Content-Type': 'application/json' },
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300 && res.data.success) {
          const { token, user } = res.data.data;
          storage.setToken(token);
          storage.setUser(user);
          
          const app = getApp();
          if (app) {
            app.globalData.token = token;
            app.globalData.userInfo = user;
          }
          
          resolve(res.data.data);
        } else {
          reject(res.data);
        }
      },
      fail: reject,
    });
  });
}

async function getUserProfile() {
  const token = storage.getToken();
  
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE_URL}/user/me`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      success(res) {
        if (res.statusCode === 200 && res.data.success) {
          storage.setUser(res.data.data);
          resolve(res.data.data);
        } else if (res.statusCode === 401) {
          storage.clearToken();
          storage.clearUser();
          reject(new Error('登录已过期'));
        } else {
          reject(res.data);
        }
      },
      fail: reject,
    });
  });
}

function ensureLogin() {
  const token = storage.getToken();
  if (token) {
    const user = storage.getUser();
    return Promise.resolve({ token, user });
  }
  return login();
}

function logout() {
  storage.clearToken();
  storage.clearUser();
  
  const app = getApp();
  if (app) {
    app.globalData.token = null;
    app.globalData.userInfo = null;
  }
}

module.exports = {
  login,
  ensureLogin,
  logout,
  getUserProfile,
  wxLoginCode,
};
