const authService = require('../../../services/auth.service');
const orderService = require('../../../services/order.service');
const packageService = require('../../../services/package.service');
const status = require('../../../utils/status');

Page({
  data: {
    orderId: '',
    order: null,
    loading: true,
    error: null,
    showIssueModal: false,
    issueDescription: '',
    currentPackageId: '',
    submitting: false,
  },

  onLoad(options) {
    const { id } = options;
    if (!id) {
      wx.showToast({
        title: '订单ID不能为空',
        icon: 'none',
      });
      wx.navigateBack();
      return;
    }
    
    this.setData({ orderId: id });
    this.loadData();
  },

  onPullDownRefresh() {
    this.loadData().finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  async loadData() {
    this.setData({ loading: true, error: null });
    
    try {
      await authService.ensureLogin();
      
      // 获取订单详情
      const res = await orderService.getOrderDetail(this.data.orderId);
      const order = res.data;
      
      // 处理订单数据
      const processedOrder = {
        ...order,
        statusLabel: status.getOrderStatusLabel(order.status),
        statusType: status.getOrderStatusType(order.status),
        paymentStatusLabel: status.getPaymentStatusLabel(order.paymentStatus),
        paymentStatusType: status.getPaymentStatusType(order.paymentStatus),
        packages: (order.packages || []).map(pkg => ({
          ...pkg,
          statusLabel: status.getPackageStatusLabel(pkg.status),
          statusType: status.getOrderStatusType(pkg.status),
        })),
      };
      
      this.setData({ order: processedOrder });
    } catch (err) {
      console.error('加载订单详情失败:', err);
      let errorMsg = '加载失败';
      if (err.statusCode === 404) {
        errorMsg = '订单不存在或已删除';
      } else if (err.statusCode === 403) {
        errorMsg = '无权查看该订单';
      }
      this.setData({ error: errorMsg });
    } finally {
      this.setData({ loading: false });
    }
  },

  onConfirmPackage(e) {
    const { id } = e.currentTarget.dataset;
    
    wx.showModal({
      title: '确认包裹',
      content: '确认后将进入下一步审核流程，是否确认？',
      confirmText: '确认',
      cancelText: '取消',
      success: async (res) => {
        if (res.confirm) {
          await this.confirmPackage(id);
        }
      },
    });
  },

  async confirmPackage(packageId) {
    this.setData({ submitting: true });
    
    try {
      await packageService.confirmPackage(packageId, { confirmNote: '确认无误' });
      
      wx.showToast({
        title: '已确认，等待审核',
        icon: 'success',
      });
      
      // 刷新数据
      this.loadData();
    } catch (err) {
      console.error('确认包裹失败:', err);
      wx.showToast({
        title: err.message || '确认失败',
        icon: 'none',
      });
    } finally {
      this.setData({ submitting: false });
    }
  },

  onReportIssue(e) {
    const { id } = e.currentTarget.dataset;
    this.setData({
      currentPackageId: id,
      showIssueModal: true,
      issueDescription: '',
    });
  },

  onIssueInput(e) {
    this.setData({ issueDescription: e.detail.value });
  },

  closeIssueModal() {
    this.setData({ showIssueModal: false });
  },

  async submitIssue() {
    const { currentPackageId, issueDescription } = this.data;
    
    if (!issueDescription.trim()) {
      wx.showToast({
        title: '请输入问题描述',
        icon: 'none',
      });
      return;
    }
    
    this.setData({ submitting: true });
    
    try {
      await packageService.reportPackageIssue(currentPackageId, {
        type: 'OTHER',
        description: issueDescription.trim(),
      });
      
      this.setData({ showIssueModal: false });
      
      wx.showToast({
        title: '已提交异常，客服会尽快处理',
        icon: 'success',
        duration: 2000,
      });
      
      // 刷新数据
      this.loadData();
    } catch (err) {
      console.error('提交异常失败:', err);
      wx.showToast({
        title: err.message || '提交失败',
        icon: 'none',
      });
    } finally {
      this.setData({ submitting: false });
    }
  },

  copyTrackingNumber(e) {
    const { number } = e.currentTarget.dataset;
    if (!number) return;
    
    wx.setClipboardData({
      data: number,
      success: () => {
        wx.showToast({
          title: '运单号已复制',
          icon: 'success',
        });
      },
    });
  },

  onRetry() {
    this.loadData();
  },
});
