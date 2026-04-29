const api = require('../../utils/api.js')

// 筛选映射
const filterMap = {
  all: null,
  inbound: 'UNINBOUND',
  confirm: 'USER_CONFIRM_PENDING',
  payment: 'PAYMENT_PENDING',
  shipped: 'SHIPPED'
}

Page({
  data: {
    orders: [],
    filteredOrders: [],
    loading: false,
    activeFilter: 'all',
    api: api
  },

  onLoad() {
    this.loadOrders()
  },

  onShow() {
    this.loadOrders()
  },

  // 加载订单列表
  loadOrders() {
    this.setData({ loading: true })

    api.order.getList().then(orders => {
      // 处理订单数据
      const processedOrders = orders.map(order => this.processOrder(order))

      this.setData({
        orders: processedOrders,
        loading: false
      }, () => {
        this.applyFilter()
      })
    }).catch(err => {
      console.error('加载订单失败:', err)
      this.setData({ loading: false })

      if (err.statusCode === 401) {
        wx.showToast({ title: '请先登录', icon: 'none' })
        setTimeout(() => {
          wx.navigateTo({ url: '/pages/login/login' })
        }, 1500)
      } else if (err.statusCode === 0) {
        // 网络错误
        wx.showModal({
          title: '网络错误',
          content: err.message || '无法连接到服务器，请检查网络设置',
          showCancel: false,
          confirmText: '重试',
          success: () => {
            this.loadOrders()
          }
        })
      } else {
        wx.showToast({
          title: err.message || '加载订单失败',
          icon: 'none',
          duration: 3000
        })
      }
    })
  },

  // 处理订单数据
  processOrder(order) {
    const statusInfo = api.utils.getStatusDisplay(order.status)
    const paymentStatusInfo = api.utils.getPaymentStatusDisplay(order.payment_status)

    return {
      ...order,
      statusLabel: statusInfo.label,
      statusType: statusInfo.type,
      paymentStatusLabel: paymentStatusInfo.label,
      paymentStatusType: paymentStatusInfo.type,
      created_at: this.formatDate(order.created_at),
      chargeable_weight: order.chargeable_weight?.toFixed(2)
    }
  },

  // 格式化日期
  formatDate(dateStr) {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()

    if (isToday) {
      return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    }

    return `${date.getMonth() + 1}月${date.getDate()}日`
  },

  // 切换筛选
  switchFilter(e) {
    const { filter } = e.currentTarget.dataset
    this.setData({ activeFilter: filter }, () => {
      this.applyFilter()
    })
  },

  // 应用筛选
  applyFilter() {
    const { orders, activeFilter } = this.data
    const targetStatus = filterMap[activeFilter]

    if (!targetStatus) {
      this.setData({ filteredOrders: orders })
      return
    }

    const filtered = orders.filter(order => order.status === targetStatus)
    this.setData({ filteredOrders: filtered })
  },

  // 跳转到详情
  goToDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/order-detail/order-detail?id=${id}`
    })
  },

  // 跳转到地址页
  goToAddress() {
    wx.navigateTo({
      url: '/pages/address/address'
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadOrders().finally(() => {
      wx.stopPullDownRefresh()
    })
  }
})
