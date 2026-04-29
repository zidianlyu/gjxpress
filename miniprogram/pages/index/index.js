const app = getApp()
const api = require('../../utils/api.js')

Page({
  data: {
    isLogin: false,
    recentOrders: [],
    userInfo: null,
    api: api
  },

  onLoad() {
    // 检查登录状态
    this.checkLoginStatus()
  },

  onShow() {
    this.checkLoginStatus()
  },

  // 检查登录状态
  checkLoginStatus() {
    const token = wx.getStorageSync('access_token')
    const isLogin = !!token
    
    this.setData({ isLogin })
    
    if (isLogin) {
      this.loadRecentOrders()
    }
  },

  // 加载最近订单
  loadRecentOrders() {
    api.order.getList().then(orders => {
      // 只显示最近3条
      const recentOrders = orders.slice(0, 3).map(order => ({
        ...order,
        created_at: this.formatDate(order.created_at)
      }))
      
      this.setData({ recentOrders })
    }).catch(err => {
      console.error('加载订单失败:', err)
    })
  },

  // 格式化日期
  formatDate(dateStr) {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}月${date.getDate()}日`
  },

  // 跳转到地址页
  goToAddress() {
    wx.navigateTo({
      url: '/pages/address/address'
    })
  },

  // 跳转到订单列表
  goToOrders() {
    if (!this.data.isLogin) {
      this.goToLogin()
      return
    }
    wx.switchTab({
      url: '/pages/orders/orders'
    })
  },

  // 跳转到订单详情
  goToOrderDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/order-detail/order-detail?id=${id}`
    })
  },

  // 联系客服
  contactService() {
    wx.showModal({
      title: '联系客服',
      content: '客服电话: 13800138000\n工作时间: 9:00-18:00',
      showCancel: false
    })
  },

  // 复制地址
  copyAddress() {
    // 先获取地址
    api.address.getWarehouse().then(address => {
      const text = `${address.name}\n收件人: ${address.recipient}\n电话: ${address.phone}\n地址: ${address.province}${address.city}${address.district}${address.address}\n邮编: ${address.zip_code}`
      
      wx.setClipboardData({
        data: text,
        success: () => {
          wx.showToast({ title: '地址已复制', icon: 'success' })
        }
      })
    }).catch(() => {
      // 使用默认地址
      const defaultAddress = `广骏集运\n收件人: 广骏集运\n电话: 13800138000\n地址: 广东省广州市白云区白云大道123号物流园A区\n邮编: 510000`
      
      wx.setClipboardData({
        data: defaultAddress,
        success: () => {
          wx.showToast({ title: '地址已复制', icon: 'success' })
        }
      })
    })
  },

  // 跳转到登录页
  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  }
})
