const app = getApp()
const api = require('../../utils/api.js')

Page({
  data: {
    isLogin: false,
    userInfo: null,
    stats: {
      total: 0,
      inbound: 0,
      confirm: 0,
      payment: 0
    }
  },

  onLoad() {
    this.checkLoginStatus()
  },

  onShow() {
    this.checkLoginStatus()
    if (this.data.isLogin) {
      this.loadUserInfo()
      this.loadStats()
    }
  },

  // 检查登录状态
  checkLoginStatus() {
    const token = wx.getStorageSync('access_token')
    const isLogin = !!token
    
    this.setData({ isLogin })
    
    if (isLogin) {
      // 优先使用全局数据
      if (app.globalData.userInfo) {
        this.setData({ userInfo: app.globalData.userInfo })
      }
    }
  },

  // 加载用户信息
  loadUserInfo() {
    api.user.getProfile().then(userInfo => {
      this.setData({ userInfo })
      app.globalData.userInfo = userInfo
    }).catch(err => {
      console.error('获取用户信息失败:', err)
    })
  },

  // 加载统计数据
  loadStats() {
    api.order.getList().then(orders => {
      const stats = {
        total: orders.length,
        inbound: orders.filter(o => o.status === 'UNINBOUND').length,
        confirm: orders.filter(o => o.status === 'USER_CONFIRM_PENDING').length,
        payment: orders.filter(o => o.status === 'PAYMENT_PENDING').length
      }
      
      this.setData({ stats })
    }).catch(err => {
      console.error('获取统计数据失败:', err)
    })
  },

  // 跳转到登录页
  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },

  // 跳转到订单列表
  goToOrders() {
    wx.switchTab({
      url: '/pages/orders/orders'
    })
  },

  // 按筛选跳转到订单列表
  goToFilterOrders(e) {
    // 先切换到订单页
    wx.switchTab({
      url: '/pages/orders/orders'
    })
    // 由于 tabBar 页面之间无法直接传参，这里可以通过全局数据或 storage 来传递筛选条件
    // 简单起见，让用户手动筛选
  },

  // 跳转到地址页
  goToAddress() {
    wx.navigateTo({
      url: '/pages/address/address'
    })
  },

  // 联系客服
  contactService() {
    wx.showModal({
      title: '客服中心',
      content: '客服电话: 13800138000\n工作时间: 9:00-18:00\n\n如有问题欢迎随时联系我们',
      showCancel: false,
      confirmText: '我知道了'
    })
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除登录数据
          wx.removeStorageSync('access_token')
          app.globalData.token = null
          app.globalData.userInfo = null
          
          this.setData({
            isLogin: false,
            userInfo: null,
            stats: { total: 0, inbound: 0, confirm: 0, payment: 0 }
          })
          
          wx.showToast({ title: '已退出登录', icon: 'success' })
        }
      }
    })
  }
})
