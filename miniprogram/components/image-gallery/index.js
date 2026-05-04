Component({
  properties: {
    images: {
      type: Array,
      value: [],
    },
    showType: {
      type: Boolean,
      value: true,
    },
  },
  methods: {
    onImageTap(e) {
      const { index } = e.currentTarget.dataset;
      const urls = this.data.images.map(img => img.url);
      wx.previewImage({
        current: urls[index],
        urls: urls,
      });
    },
    getTypeLabel(type) {
      const typeMap = {
        'OUTER': '外包装',
        'LABEL': '面单',
        'INNER': '内部物品',
        'EXCEPTION': '异常',
      };
      return typeMap[type] || '照片';
    },
  },
});
