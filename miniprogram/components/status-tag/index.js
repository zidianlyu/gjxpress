Component({
  properties: {
    label: {
      type: String,
      value: '',
    },
    type: {
      type: String,
      value: 'normal',
    },
  },
  data: {
    styleClass: '',
  },
  lifetimes: {
    attached() {
      this.updateStyle();
    },
  },
  observers: {
    'type': function() {
      this.updateStyle();
    },
  },
  methods: {
    updateStyle() {
      const typeClassMap = {
        normal: 'status-tag-normal',
        primary: 'status-tag-primary',
        success: 'status-tag-success',
        warning: 'status-tag-warning',
        danger: 'status-tag-danger',
      };
      this.setData({
        styleClass: typeClassMap[this.data.type] || 'status-tag-normal',
      });
    },
  },
});
