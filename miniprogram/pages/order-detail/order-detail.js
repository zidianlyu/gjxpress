const api = require('../../utils/api.js')

// 状态描述映射
const statusDescMap = {
  UNINBOUND: '您的包裹正在运往仓库',
  INBOUNDED: '包裹已入库，等待确认',
  USER_CONFIRM_PENDING: '请核对包裹照片和重量',
  REVIEW_PENDING: '仓库正在审核您的包裹',
  PAYMENT_PENDING: '请支付运费后安排发货',
  PAID: '已支付，准备安排发货',
  READY_TO_SHIP: '正在安排国际物流',
  SHIPPED: '包裹已发出，请注意查收',
  COMPLETED: '订单已完成，感谢您的使用'
}

Page({
  data: {
    order: null,
    loading: true,
    canPay: false,
    hasPendingConfirm: false,
    statusDesc: '',
    // 每个包裹的问题描述
    issueInputs: {}
  },

  onLoad(options) {
    const { id } = options
    if (id) {
      this.loadOrderDetail(id)
    } else {
      wx.showToast({ title: '订单ID不存在', icon: 'none' })
      wx.navigateBack()
    }
  },

  onShow() {
    // 刷新订单详情
    if (this.data.order?.id) {
      this.loadOrderDetail(this.data.order.id)
    }
  },

  // 加载订单详情
  loadOrderDetail(id) {
    this.setData({ loading: true })
    
    api.order.getDetail(id).then(order => {
      // 处理订单数据
      const processedOrder = this.processOrder(order)
      
      // 检查是否有待确认的包裹
      const hasPendingConfirm = order.packages.some(
        pkg => pkg.status === 'INBOUNDED' && !pkg.user_confirmed_at
      )
      
      // 检查是否可以支付
      const canPay = order.payment_status === 'UNPAID' || order.payment_status === 'PROCESSING'
      
      this.setData({
        order: processedOrder,
        loading: false,
        canPay,
        hasPendingConfirm,
        statusDesc: statusDescMap[order.status] || ''
      })
    }).catch(err => {
      console.error('加载订单详情失败:', err)
      this.setData({ loading: false })
      
      if (err.message === 'Unauthorized') {
        wx.navigateTo({ url: '/pages/login/login' })
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
      created_at: this.formatDateTime(order.created_at),
      chargeable_weight: order.chargeable_weight?.toFixed(2),
      packages: order.packages.map(pkg => this.processPackage(pkg)),
      shipment: order.shipment ? {
        ...order.shipment,
        shipped_at: order.shipment.shipped_at ? this.formatDateTime(order.shipment.shipped_at) : null
      } : null
    }
  },

  // 处理包裹数据
  processPackage(pkg) {
    const statusInfo = api.utils.getStatusDisplay(pkg.status)
    
    return {
      ...pkg,
      statusLabel: statusInfo.label,
      statusType: statusInfo.type,
      actual_weight: pkg.actual_weight?.toFixed(2),
      volume_weight: pkg.volume_weight?.toFixed(2),
      length: pkg.length?.toFixed(0),
      width: pkg.width?.toFixed(0),
      height: pkg.height?.toFixed(0),
      inbound_time: pkg.inbound_time ? this.formatDateTime(pkg.inbound_time) : null,
      // 是否需要用户确认（INBOUNDED 状态且未确认）
      needConfirm: pkg.status === 'INBOUNDED' && !pkg.user_confirmed_at,
      showIssueForm: false
    }
  },

  // 格式化日期时间
  formatDateTime(dateStr) {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  },

  // 预览图片
  previewImage(e) {
    const { url, images } = e.currentTarget.dataset
    const urls = images.map(img => img.url)
    
    wx.previewImage({
      current: url,
      urls: urls
    })
  },

  // 确认包裹无误
  confirmPackage(e) {
    const { packageId } = e.currentTarget.dataset
    
    wx.showModal({
      title: '确认包裹',
      content: '确认该包裹信息无误吗？',
      confirmText: '确认',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' })
          
          api.package.confirm(packageId).then(() => {
            wx.hideLoading()
            wx.showToast({ title: '确认成功', icon: 'success' })
            // 刷新订单详情
            this.loadOrderDetail(this.data.order.id)
          }).catch(err => {
            wx.hideLoading()
            wx.showToast({ title: err.message || '确认失败', icon: 'none' })
          })
        }
      }
    })
  },

  // 显示问题表单
  reportIssue(e) {
    const { packageId } = e.currentTarget.dataset
    const { order } = this.data
    
    // 找到对应的包裹并显示表单
    const packages = order.packages.map(pkg => ({
      ...pkg,
      showIssueForm: pkg.id === packageId ? true : pkg.showIssueForm
    }))
    
    this.setData({
      'order.packages': packages
    })
  },

  // 输入问题描述
  onIssueInput(e) {
    const { packageId } = e.currentTarget.dataset
    const { value } = e.detail
    
    this.setData({
      [`issueInputs.${packageId}`]: value
    })
  },

  // 取消提交问题
  cancelIssue(e) {
    const { packageId } = e.currentTarget.dataset
    const { order } = this.data
    
    const packages = order.packages.map(pkg => ({
      ...pkg,
      showIssueForm: pkg.id === packageId ? false : pkg.showIssueForm
    }))
    
    this.setData({
      'order.packages': packages
    })
  },

  // 提交问题
  submitIssue(e) {
    const { packageId } = e.currentTarget.dataset
    const description = this.data.issueInputs[packageId]
    
    if (!description || !description.trim()) {
      wx.showToast({ title: '请输入问题描述', icon: 'none' })
      return
    }
    
    wx.showLoading({ title: '提交中...' })
    
    api.package.reportIssue(packageId, description).then(() => {
      wx.hideLoading()
      wx.showToast({ title: '问题已提交', icon: 'success' })
      
      // 清空输入并刷新
      this.setData({
        [`issueInputs.${packageId}`]: ''
      })
      this.loadOrderDetail(this.data.order.id)
    }).catch(err => {
      wx.hideLoading()
      wx.showToast({ title: err.message || '提交失败', icon: 'none' })
    })
  },

  // 复制追踪号
  copyTracking() {
    const { order } = this.data
    if (order.shipment?.tracking_number) {
      wx.setClipboardData({
        data: order.shipment.tracking_number,
        success: () => {
          wx.showToast({ title: '已复制', icon: 'success' })
        }
      })
    }
  },

  // 去支付
  goToPay() {
    wx.showModal({
      title: '支付',
      content: '支付功能暂未接入，请联系客服完成支付',
      showCancel: false
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    if (this.data.order?.id) {
      this.loadOrderDetail(this.data.order.id).finally(() => {
        wx.stopPullDownRefresh()
      })
    } else {
      wx.stopPullDownRefresh()
    }
  }
})
