const api = require('./utils/api.js')

App({
  globalData: {
    userInfo: null,
    token: null,
    apiBaseUrl: 'http://localhost:3000/api'
  },

  onLaunch() {
    // 检查本地存储的token
    const token = wx.getStorageSync('access_token')
    if (token) {
      this.globalData.token = token
      this.getUserProfile()
    }
  },

  // 微信登录
  wxLogin() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            // 调用后端登录接口
            wx.request({
              url: `${this.globalData.apiBaseUrl}/auth/login`,
              method: 'POST',
              data: {
                code: res.code,
                nickname: this.globalData.userInfo?.nickName,
                avatar: this.globalData.userInfo?.avatarUrl
              },
              success: (loginRes) => {
                if (loginRes.data && loginRes.data.access_token) {
                  const token = loginRes.data.access_token
                  wx.setStorageSync('access_token', token)
                  this.globalData.token = token
                  this.globalData.userInfo = loginRes.data.user
                  resolve(loginRes.data)
                } else {
                  reject(new Error('登录失败'))
                }
              },
              fail: reject
            })
          } else {
            reject(new Error('获取微信登录凭证失败'))
          }
        },
        fail: reject
      })
    })
  },

  // 获取用户信息
  getUserProfile() {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${this.globalData.apiBaseUrl}/user/profile`,
        method: 'GET',
        header: {
          'Authorization': `Bearer ${this.globalData.token}`
        },
        success: (res) => {
          if (res.statusCode === 200) {
            this.globalData.userInfo = res.data
            resolve(res.data)
          } else {
            // token 失效，需要重新登录
            this.clearLoginData()
            reject(new Error('登录已过期'))
          }
        },
        fail: reject
      })
    })
  },

  // 清除登录数据
  clearLoginData() {
    wx.removeStorageSync('access_token')
    this.globalData.token = null
    this.globalData.userInfo = null
  },

  // 检查登录状态
  checkLogin() {
    return !!this.globalData.token
  }
})
