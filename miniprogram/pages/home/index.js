const authService = require('../../services/auth.service');
const orderService = require('../../services/order.service');
const status = require('../../utils/status');

Page({
  data: {
    user: null,
    stats: {
      pendingConfirm: 0,
      pendingPay: 0,
      shipped: 0,
      exception: 0,
    },
    loading: true,
    error: null,
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    // 每次显示时刷新数据
    if (!this.data.loading) {
      this.loadData();
    }
  },

  onPullDownRefresh() {
    this.loadData().finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  async loadData() {
    this.setData({ loading: true, error: null });
    
    try {
      // 确保已登录
      await authService.ensureLogin();
      
      // 获取用户信息
      const user = getApp().globalData.userInfo;
      this.setData({ user });
      
      // 获取订单统计
      await this.loadOrderStats();
    } catch (err) {
      console.error('加载首页数据失败:', err);
      this.setData({ error: err.message || '加载失败' });
      wx.showToast({
        title: '登录失败，请重试',
        icon: 'none',
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  async loadOrderStats() {
    try {
      const res = await orderService.getOrders({ pageSize: 100 });
      const orders = res.data?.items || [];
      
      // 统计各状态订单数量
      const stats = {
        pendingConfirm: orders.filter(o => o.status === 'USER_CONFIRM_PENDING').length,
        pendingPay: orders.filter(o => o.status === 'PAYMENT_PENDING').length,
        shipped: orders.filter(o => o.status === 'SHIPPED').length,
        exception: orders.filter(o => o.status === 'EXCEPTION').length,
      };
      
      this.setData({ stats });
    } catch (err) {
      console.error('加载订单统计失败:', err);
    }
  },

  goToAddress() {
    wx.switchTab({
      url: '/pages/address/index',
    });
  },

  goToOrders() {
    wx.switchTab({
      url: '/pages/orders/list/index',
    });
  },

  goToOrdersByStatus(e) {
    const { status: orderStatus } = e.currentTarget.dataset;
    wx.switchTab({
      url: '/pages/orders/list/index',
    });
    // 存储筛选状态，让订单列表页读取
    wx.setStorageSync('order_filter_status', orderStatus);
  },

  goToCustomerService() {
    wx.navigateTo({
      url: '/pages/customer-service/index',
    });
  },

  onRetry() {
    this.loadData();
  },
});
