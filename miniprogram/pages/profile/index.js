const authService = require('../../services/auth.service');

Page({
  data: {
    user: null,
    version: '1.0.0',
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  async loadData() {
    try {
      await authService.ensureLogin();
      const user = getApp().globalData.userInfo;
      this.setData({ user });
    } catch (err) {
      console.error('加载用户信息失败:', err);
    }
  },

  goToOrders() {
    wx.switchTab({
      url: '/pages/orders/list/index',
    });
  },

  goToAddress() {
    wx.switchTab({
      url: '/pages/address/index',
    });
  },

  goToPrivacy() {
    wx.navigateTo({
      url: '/pages/privacy/index',
    });
  },

  goToCustomerService() {
    wx.navigateTo({
      url: '/pages/customer-service/index',
    });
  },

  onLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          authService.logout();
          wx.showToast({
            title: '已退出登录',
            icon: 'success',
          });
          // 刷新页面
          this.setData({ user: null });
        }
      },
    });
  },
});
