const TOKEN_KEY = 'gjxpress_access_token';
const USER_KEY = 'gjxpress_user';

function getToken() {
  return wx.getStorageSync(TOKEN_KEY);
}

function setToken(token) {
  wx.setStorageSync(TOKEN_KEY, token);
}

function clearToken() {
  wx.removeStorageSync(TOKEN_KEY);
}

function getUser() {
  return wx.getStorageSync(USER_KEY);
}

function setUser(user) {
  wx.setStorageSync(USER_KEY, user);
}

function clearUser() {
  wx.removeStorageSync(USER_KEY);
}

module.exports = {
  getToken,
  setToken,
  clearToken,
  getUser,
  setUser,
  clearUser,
};
