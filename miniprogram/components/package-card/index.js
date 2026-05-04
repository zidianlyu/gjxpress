const status = require('../../utils/status');

Component({
  properties: {
    package: {
      type: Object,
      value: {},
    },
    showActions: {
      type: Boolean,
      value: false,
    },
  },
  data: {
    statusLabel: '',
    statusType: '',
  },
  lifetimes: {
    attached() {
      this.updateStatus();
    },
  },
  observers: {
    'package.status': function() {
      this.updateStatus();
    },
  },
  methods: {
    updateStatus() {
      const packageStatus = this.data.package?.status || '';
      this.setData({
        statusLabel: status.getPackageStatusLabel(packageStatus),
        statusType: status.getOrderStatusType(packageStatus),
      });
    },
    onConfirmTap() {
      this.triggerEvent('confirm', { packageId: this.data.package.id });
    },
    onIssueTap() {
      this.triggerEvent('issue', { packageId: this.data.package.id });
    },
    onImageTap(e) {
      const { url } = e.currentTarget.dataset;
      const urls = this.data.package.images?.map(img => img.url) || [];
      wx.previewImage({
        current: url,
        urls: urls,
      });
    },
  },
});
