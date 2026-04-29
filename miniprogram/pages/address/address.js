const api = require('../../utils/api.js')

// 默认地址（API失败时使用）
const defaultAddress = {
  name: '广骏国内仓库',
  recipient: '广骏集运',
  phone: '13800138000',
  province: '广东省',
  city: '广州市',
  district: '白云区',
  address: '白云大道123号物流园A区',
  zip_code: '510000'
}

Page({
  data: {
    address: defaultAddress,
    userInfo: null
  },

  onLoad() {
    this.loadAddress()
    this.loadUserInfo()
  },

  onShow() {
    this.loadUserInfo()
  },

  // 加载地址信息
  loadAddress() {
    api.address.getWarehouse().then(address => {
      this.setData({ address })
    }).catch(err => {
      console.error('加载地址失败:', err)
      // 使用默认地址
      this.setData({ address: defaultAddress })
    })
  },

  // 加载用户信息
  loadUserInfo() {
    const app = getApp()
    if (app.globalData.userInfo) {
      this.setData({ userInfo: app.globalData.userInfo })
    } else {
      // 尝试从本地存储获取
      const token = wx.getStorageSync('access_token')
      if (token) {
        api.user.getProfile().then(userInfo => {
          this.setData({ userInfo })
          app.globalData.userInfo = userInfo
        }).catch(() => {
          // 未登录不报错
        })
      }
    }
  },

  // 复制用户代码
  copyUserCode() {
    const { userInfo } = this.data
    if (!userInfo?.user_code) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    
    wx.setClipboardData({
      data: userInfo.user_code,
      success: () => {
        wx.showToast({ title: '用户代码已复制', icon: 'success' })
      }
    })
  },

  // 复制完整地址
  copyFullAddress() {
    const { address, userInfo } = this.data
    
    // 如果有用户代码，添加到收件人
    const recipient = userInfo?.user_code 
      ? `${address.recipient} ${userInfo.user_code}`
      : address.recipient
    
    const fullAddress = `收件人: ${recipient}
电话: ${address.phone}
地址: ${address.province}${address.city}${address.district}${address.address}
邮编: ${address.zip_code}`
    
    wx.setClipboardData({
      data: fullAddress,
      success: () => {
        wx.showToast({ title: '地址已复制', icon: 'success' })
      }
    })
  }
})
