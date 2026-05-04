Page({
  data: {
    serviceInfo: {
      wechat: 'gjxpress_support',
      workHours: '周一至周六 9:00-18:00',
      email: 'support@gjxpress.net',
    },
    faqs: [
      {
        question: '入库后多久可以看到照片？',
        answer: '仓库通常在收到包裹后24小时内完成入库检查并上传照片，您会收到通知提醒查看。',
      },
      {
        question: '如何确认我的包裹？',
        answer: '当包裹状态为"待用户确认"时，在订单详情页可以看到包裹照片，确认无误后点击"确认无误"按钮即可。',
      },
      {
        question: '未支付订单是否发货？',
        answer: '未支付订单默认不会发货。请您根据客服通知完成支付后，我们会尽快安排发货。',
      },
      {
        question: '包裹有问题怎么办？',
        answer: '如发现有破损、少件等问题，请在订单详情页点击"有问题"按钮提交异常反馈，客服会尽快处理。',
      },
      {
        question: '如何查询物流信息？',
        answer: '订单发货后，在订单详情页可以查看物流渠道、运单号和发货状态。',
      },
      {
        question: '一个订单可以包含多个包裹吗？',
        answer: '可以的。您可以将多个订单的商品发往同一仓库地址，我们会合并到一个订单中处理。',
      },
    ],
    expandedIndex: -1,
  },

  onLoad() {
    // 页面加载
  },

  copyWechat() {
    wx.setClipboardData({
      data: this.data.serviceInfo.wechat,
      success: () => {
        wx.showToast({
          title: '微信号已复制',
          icon: 'success',
        });
      },
    });
  },

  toggleFaq(e) {
    const { index } = e.currentTarget.dataset;
    if (this.data.expandedIndex === index) {
      this.setData({ expandedIndex: -1 });
    } else {
      this.setData({ expandedIndex: index });
    }
  },
});
