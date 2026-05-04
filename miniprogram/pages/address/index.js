const authService = require('../../services/auth.service');
const addressService = require('../../services/address.service');

Page({
  data: {
    user: null,
    address: null,
    loading: true,
    error: null,
    copied: false,
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    if (!this.data.loading) {
      this.loadData();
    }
  },

  async loadData() {
    this.setData({ loading: true, error: null });
    
    try {
      // 确保已登录
      await authService.ensureLogin();
      
      // 获取用户信息
      const user = getApp().globalData.userInfo;
      this.setData({ user });
      
      // 获取仓库地址
      await this.loadAddress();
    } catch (err) {
      console.error('加载地址失败:', err);
      this.setData({ error: err.message || '加载失败' });
    } finally {
      this.setData({ loading: false });
    }
  },

  async loadAddress() {
    try {
      const res = await addressService.getWarehouseAddress();
      this.setData({
        address: res.data,
      });
    } catch (err) {
      console.error('获取仓库地址失败:', err);
      // 使用默认地址
      this.setData({
        address: this.getDefaultAddress(),
      });
    }
  },

  getDefaultAddress() {
    const userCode = this.data.user?.userCode || '';
    return {
      receiverName: `广骏仓-${userCode}`,
      phone: '400-000-0000',
      province: '广东省',
      city: '广州市',
      district: '白云区',
      addressLine: '示例仓库路1号广骏仓储中心',
      postalCode: '510000',
      userCode: userCode,
      fullText: `收件人：广骏仓-${userCode}\n电话：400-000-0000\n地址：广东省广州市白云区示例仓库路1号广骏仓储中心\n备注：请保留用户ID ${userCode}`,
    };
  },

  copyAddress() {
    const { address } = this.data;
    if (!address) {
      wx.showToast({
        title: '地址信息加载中',
        icon: 'none',
      });
      return;
    }

    const text = `收件人：${address.receiverName}
电话：${address.phone}
地址：${address.province}${address.city}${address.district}${address.addressLine}
备注：请保留用户ID ${address.userCode}`;

    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({
          title: '已复制，请粘贴到淘宝/京东',
          icon: 'none',
          duration: 2000,
        });
        this.setData({ copied: true });
        setTimeout(() => {
          this.setData({ copied: false });
        }, 3000);
      },
      fail: () => {
        wx.showToast({
          title: '复制失败，请重试',
          icon: 'none',
        });
      },
    });
  },

  onRetry() {
    this.loadData();
  },
});
