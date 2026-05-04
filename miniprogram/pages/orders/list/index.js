const authService = require('../../../services/auth.service');
const orderService = require('../../../services/order.service');
const status = require('../../../utils/status');

const TABS = [
  { key: '', label: '全部' },
  { key: 'USER_CONFIRM_PENDING', label: '待确认' },
  { key: 'PAYMENT_PENDING', label: '待支付' },
  { key: 'SHIPPED', label: '已发货' },
  { key: 'EXCEPTION', label: '异常' },
];

Page({
  data: {
    tabs: TABS,
    currentTab: 0,
    orders: [],
    loading: true,
    error: null,
    hasMore: false,
    page: 1,
    pageSize: 20,
    filterStatus: '',
  },

  onLoad(options) {
    // 检查是否有筛选状态
    const filterStatus = wx.getStorageSync('order_filter_status');
    if (filterStatus) {
      const tabIndex = TABS.findIndex(t => t.key === filterStatus);
      if (tabIndex > 0) {
        this.setData({
          currentTab: tabIndex,
          filterStatus: filterStatus,
        });
      }
      // 清除存储的筛选状态
      wx.removeStorageSync('order_filter_status');
    }
    
    this.loadData();
  },

  onShow() {
    // 刷新数据
    if (!this.data.loading) {
      this.refreshData();
    }
  },

  onPullDownRefresh() {
    this.refreshData().finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMore();
    }
  },

  onTabChange(e) {
    const { index } = e.currentTarget.dataset;
    const filterStatus = TABS[index].key;
    
    this.setData({
      currentTab: index,
      filterStatus,
      orders: [],
      page: 1,
      hasMore: false,
    }, () => {
      this.refreshData();
    });
  },

  async refreshData() {
    this.setData({
      page: 1,
      orders: [],
      hasMore: false,
    });
    await this.loadData();
  },

  async loadData() {
    this.setData({ loading: true, error: null });
    
    try {
      await authService.ensureLogin();
      
      const params = {
        page: this.data.page,
        pageSize: this.data.pageSize,
      };
      
      if (this.data.filterStatus) {
        params.status = this.data.filterStatus;
      }
      
      const res = await orderService.getOrders(params);
      const items = res.data?.items || [];
      const pagination = res.data?.pagination || {};
      
      // 处理订单数据
      const processedOrders = items.map(order => ({
        ...order,
        statusLabel: status.getOrderStatusLabel(order.status),
        statusType: status.getOrderStatusType(order.status),
        paymentStatusLabel: status.getPaymentStatusLabel(order.paymentStatus),
        paymentStatusType: status.getPaymentStatusType(order.paymentStatus),
      }));
      
      this.setData({
        orders: processedOrders,
        hasMore: this.data.page < pagination.totalPages,
      });
    } catch (err) {
      console.error('加载订单失败:', err);
      this.setData({ error: err.message || '加载失败' });
    } finally {
      this.setData({ loading: false });
    }
  },

  async loadMore() {
    if (this.data.loading) return;
    
    this.setData({ loading: true });
    
    try {
      const nextPage = this.data.page + 1;
      
      const params = {
        page: nextPage,
        pageSize: this.data.pageSize,
      };
      
      if (this.data.filterStatus) {
        params.status = this.data.filterStatus;
      }
      
      const res = await orderService.getOrders(params);
      const items = res.data?.items || [];
      const pagination = res.data?.pagination || {};
      
      const processedOrders = items.map(order => ({
        ...order,
        statusLabel: status.getOrderStatusLabel(order.status),
        statusType: status.getOrderStatusType(order.status),
        paymentStatusLabel: status.getPaymentStatusLabel(order.paymentStatus),
        paymentStatusType: status.getPaymentStatusType(order.paymentStatus),
      }));
      
      this.setData({
        orders: [...this.data.orders, ...processedOrders],
        page: nextPage,
        hasMore: nextPage < pagination.totalPages,
      });
    } catch (err) {
      console.error('加载更多订单失败:', err);
      wx.showToast({
        title: '加载失败',
        icon: 'none',
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  goToOrderDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/orders/detail/index?id=${id}`,
    });
  },

  goToAddress() {
    wx.switchTab({
      url: '/pages/address/index',
    });
  },

  goToCustomerService() {
    wx.navigateTo({
      url: '/pages/customer-service/index',
    });
  },

  onRetry() {
    this.refreshData();
  },
});
