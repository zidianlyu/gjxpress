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
          const error = new Error('Unauthorized')
          error.statusCode = 401
          error.message = '登录已过期，请重新登录'
          reject(error)
        } else if (res.statusCode === 403) {
          const error = new Error('Forbidden')
          error.statusCode = 403
          error.message = res.data?.message || '无权访问此资源'
          reject(error)
        } else if (res.statusCode === 404) {
          const error = new Error('Not Found')
          error.statusCode = 404
          error.message = res.data?.message || '请求的资源不存在'
          reject(error)
        } else if (res.statusCode === 400) {
          const error = new Error('Bad Request')
          error.statusCode = 400
          error.message = res.data?.message || '请求参数错误'
          reject(error)
        } else {
          const error = new Error('Request Failed')
          error.statusCode = res.statusCode
          error.message = res.data?.message || `请求失败 (${res.statusCode})`
          reject(error)
        }
      },
      fail: (err) => {
        // 区分不同类型的网络错误
        let errorMsg = '网络请求失败'
        if (err.errMsg && err.errMsg.includes('timeout')) {
          errorMsg = '请求超时，请检查网络连接'
        } else if (err.errMsg && err.errMsg.includes('fail')) {
          errorMsg = '无法连接到服务器，请检查网络'
        }
        const error = new Error('Network Error')
        error.statusCode = 0
        error.message = errorMsg
        error.originalError = err
        reject(error)
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

    // 报告问题 (异常) - 使用 confirm 端点，action 为 REPORT_ISSUE
    reportIssue(packageId, description) {
      return request({
        url: `${api.getBaseUrl()}/packages/${packageId}/confirm`,
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
