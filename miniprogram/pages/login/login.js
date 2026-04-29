const app = getApp()
const api = require('../../utils/api.js')

Page({
  data: {
    loading: false
  },

  // 微信登录
  handleWxLogin() {
    this.setData({ loading: true })
    
    wx.login({
      success: (res) => {
        if (res.code) {
          // 获取用户信息（可选）
          this.loginWithCode(res.code)
        } else {
          wx.showToast({ title: '登录失败', icon: 'none' })
          this.setData({ loading: false })
        }
      },
      fail: () => {
        wx.showToast({ title: '获取登录凭证失败', icon: 'none' })
        this.setData({ loading: false })
      }
    })
  },

  // 使用 code 登录
  loginWithCode(code) {
    api.user.login(code).then(data => {
      // 保存 token
      wx.setStorageSync('access_token', data.access_token)
      app.globalData.token = data.access_token
      app.globalData.userInfo = data.user
      
      wx.showToast({ title: '登录成功', icon: 'success' })
      
      // 返回首页
      setTimeout(() => {
        wx.switchTab({ url: '/pages/index/index' })
      }, 1000)
    }).catch(err => {
      wx.showToast({ title: err.message || '登录失败', icon: 'none' })
    }).finally(() => {
      this.setData({ loading: false })
    })
  },

  // 开发测试登录
  handleDevLogin() {
    this.setData({ loading: true })
    
    // 使用 mock code 直接登录
    api.user.login('dev_mock_code_123').then(data => {
      wx.setStorageSync('access_token', data.access_token)
      app.globalData.token = data.access_token
      app.globalData.userInfo = data.user
      
      wx.showToast({ title: '登录成功', icon: 'success' })
      
      setTimeout(() => {
        wx.switchTab({ url: '/pages/index/index' })
      }, 1000)
    }).catch(err => {
      wx.showToast({ title: err.message || '登录失败', icon: 'none' })
    }).finally(() => {
      this.setData({ loading: false })
    })
  }
})
