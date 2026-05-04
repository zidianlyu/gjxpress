Component({
  properties: {
    title: {
      type: String,
      value: '暂无数据',
    },
    message: {
      type: String,
      value: '',
    },
    buttonText: {
      type: String,
      value: '',
    },
    showIcon: {
      type: Boolean,
      value: true,
    },
  },
  methods: {
    onButtonTap() {
      this.triggerEvent('buttontap');
    },
  },
});
