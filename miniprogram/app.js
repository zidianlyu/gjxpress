const { API_BASE_URL } = require('./config/index.js');
const storage = require('./utils/storage.js');
const auth = require('./utils/auth.js');

App({
  globalData: {
    userInfo: null,
    token: null,
    apiBaseUrl: API_BASE_URL,
  },

  onLaunch() {
    // 检查本地存储的token
    const token = storage.getToken();
    const user = storage.getUser();
    if (token && user) {
      this.globalData.token = token;
      this.globalData.userInfo = user;
    }
  },

  // 微信登录
  wxLogin() {
    return auth.login();
  },

  // 获取用户信息
  getUserProfile() {
    return auth.getUserProfile();
  },

  // 确保已登录
  ensureLogin() {
    return auth.ensureLogin();
  },

  // 清除登录数据
  clearLoginData() {
    auth.logout();
    this.globalData.token = null;
    this.globalData.userInfo = null;
  },

  // 检查登录状态
  checkLogin() {
    return !!this.globalData.token;
  },
});
