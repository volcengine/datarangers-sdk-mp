[English](./README.md) | 简体中文

# `DataRangers SDK - 小程序`

## 构建 SDK

```javascript
npm install
npm run build
```

## 使用方式

### 1. 在小程序的 app.js 中初始化 SDK

```javascript
// 本地构建的引用方式，dist指本地构建后生成的dist目录
// const $$SDK = require('dist/tob/mp');

// 线上包的引用方式
const $$SDK = require('@datarangers/sdk-mp');

$$SDK.init({
  app_id: 0000, // 替换成申请到的APP_ID
  auto_report: true,
  log: true, // 是否打印日志
});

$$SDK.config({
  xxx: 'abc',
});

$$SDK.send(); // 初始化完成，事件开始上报

App({
  onLaunch: function () {
    this.$$SDK = $$SDK; // 将SDK实例绑定到App全局对象上，方便在页面上调用

    //……
  },
});
```

### 2. 上报自定义用户行为事件

```javascript
// 比如上报“用户点击播放视频”事件
app.$$SDK.event('play_video', {
  title: 'Here is the video title',
});
```

### 3. 使用当前登录用户的信息做为唯一标识来进行上报

```javascript
// 可以在用户登录后获取带有唯一性的标识来设置给user_unique_id
setTimeout(() => {
  app.$$SDK.config({
    user_unique_id: 'zhangsan', // 用户唯一标识，比如可以是小程序的用户open_id
  });
}, 1000);
```
