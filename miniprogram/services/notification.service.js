function requestSubscribe(tmplIds) {
  return new Promise((resolve, reject) => {
    wx.requestSubscribeMessage({
      tmplIds,
      success: resolve,
      fail: reject,
    });
  });
}

module.exports = { requestSubscribe };
