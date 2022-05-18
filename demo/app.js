// app.js

import $$sdk from '@datarangers/sdk-mp';
$$sdk.init({
  app_id: 1338,
  log: true,
  auto_report: true,
});
$$sdk.config({
  user_unique_id: 'tangseng',
  location: 'js',
});
$$sdk.send();

App({
  onLaunch() {
    $$sdk.event('test_event', {
      x: 1,
      y: 'a',
    });

    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
  },
  globalData: {
    userInfo: null
  }
})
