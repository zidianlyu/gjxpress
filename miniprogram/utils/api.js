// API 请求封装
const app = getApp()

// 状态映射
const statusMap = {
  // 订单状态
  UNINBOUND: { label: '未入库', type: 'default' },
  INBOUNDED: { label: '已入库', type: 'primary' },
  USER_CONFIRM_PENDING: { label: '待用户确认', type: 'warning' },
  REVIEW_PENDING: { label: '待审核', type: 'warning' },
  PAYMENT_PENDING: { label: '待支付', type: 'danger' },
  PAID: { label: '已支付', type: 'success' },
  READY_TO_SHIP: { label: '待发货', type: 'primary' },
  SHIPPED: { label: '已发货', type: 'blue' },
  COMPLETED: { label: '已完成', type: 'success' },
  // 包裹状态
  PENDING: { label: '待处理', type: 'default' },
  CONFIRMED: { label: '已确认', type: 'success' },
  EXCEPTION: { label: '异常', type: 'danger' }
}

// 支付状态映射
const paymentStatusMap = {
  UNPAID: { label: '未支付', type: 'danger' },
  PROCESSING: { label: '支付处理中', type: 'warning' },
  PAID: { label: '已支付', type: 'success' }
}

// 获取状态显示
function getStatusDisplay(status, isPayment = false) {
  const map = isPayment ? paymentStatusMap : statusMap
  return map[status] || { label: status, type: 'default' }
}

// 基础请求封装
function request(options) {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('access_token')
    
    wx.request({
      ...options,
      header: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.header
      },
      success: (res) => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve(res.data)
        } else if (res.statusCode === 401) {
          // token 过期，清除登录状态
          wx.removeStorageSync('access_token')
          wx.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
          setTimeout(() => {
            wx.navigateTo({ url: '/pages/login/login' })
          }, 1500)
          reject(new Error('Unauthorized'))
        } else {
          const message = res.data?.message || `请求失败 (${res.statusCode})`
          wx.showToast({ title: message, icon: 'none' })
          reject(new Error(message))
        }
      },
      fail: (err) => {
        wx.showToast({ title: '网络请求失败', icon: 'none' })
        reject(err)
      }
    })
  })
}

// API 方法
const api = {
  // 获取基础URL
  getBaseUrl() {
    const app = getApp()
    return app ? app.globalData.apiBaseUrl : 'http://localhost:3000/api'
  },

  // 用户相关
  user: {
    // 微信登录
    login(code, nickname, avatar) {
      return request({
        url: `${api.getBaseUrl()}/auth/login`,
        method: 'POST',
        data: { code, nickname, avatar }
      })
    },

    // 获取用户信息
    getProfile() {
      return request({
        url: `${api.getBaseUrl()}/user/profile`,
        method: 'GET'
      })
    }
  },

  // 订单相关
  order: {
    // 获取订单列表
    getList() {
      return request({
        url: `${api.getBaseUrl()}/orders`,
        method: 'GET'
      })
    },

    // 获取订单详情
    getDetail(id) {
      return request({
        url: `${api.getBaseUrl()}/orders/${id}`,
        method: 'GET'
      })
    }
  },

  // 包裹相关
  package: {
    // 确认包裹
    confirm(packageId) {
      return request({
        url: `${api.getBaseUrl()}/packages/${packageId}/confirm`,
        method: 'POST',
        data: { action: 'CONFIRM' }
      })
    },

    // 报告问题
    reportIssue(packageId, description) {
      return request({
        url: `${api.getBaseUrl()}/packages/${packageId}/issue`,
        method: 'POST',
        data: { action: 'REPORT_ISSUE', description }
      })
    },

    // 获取包裹图片
    getImages(packageId) {
      return request({
        url: `${api.getBaseUrl()}/packages/${packageId}/images`,
        method: 'GET'
      })
    }
  },

  // 地址相关
  address: {
    // 获取仓库地址
    getWarehouse() {
      return request({
        url: `${api.getBaseUrl()}/address/warehouse`,
        method: 'GET'
      })
    }
  },

  // 工具方法
  utils: {
    getStatusDisplay,
    getPaymentStatusDisplay: (status) => getStatusDisplay(status, true)
  }
}

module.exports = api
