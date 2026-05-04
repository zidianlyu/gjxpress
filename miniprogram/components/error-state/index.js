Component({
  properties: {
    message: {
      type: String,
      value: '加载失败，请稍后重试',
    },
    retryText: {
      type: String,
      value: '重试',
    },
    showIcon: {
      type: Boolean,
      value: true,
    },
  },
  methods: {
    onRetryTap() {
      this.triggerEvent('retry');
    },
  },
});
