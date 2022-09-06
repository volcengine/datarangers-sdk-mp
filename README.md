English | [简体中文](./README.zh-CN.md)

# `DataRangers SDK - mp`

## Build SDK

```javascript
npm install
npm run build
```

## Sample

### 1. Initialize the SDK in app.js

```javascript
// locally built references
// const $$SDK = require('dist/tob/mp');

// online package references
const $$SDK = require('@datarangers/sdk-mp');

$$SDK.init({
  app_id: 0000, // Replace it with the "APP_ID"
  auto_report: true,
  log: true, // Whether to print the log
});

$$SDK.config({
  xxx: 'abc',
});

$$SDK.send(); // Setup complete and now events can be sent.

App({
  onLaunch: function () {
    this.$$SDK = $$SDK; // Bind to the global app function to be called by other pages.

    //……
  },
});
```

### 2. Report custom user behavior events

```javascript
// Take reporting the "video clicked" behavior of users for example
app.$$SDK.event('play_video', {
  title: 'Here is the video title',
});
```

### 3. Report the unique identifier of the currently logged in user

```javascript
// Set "user_unique_id" after a user logs in and the user's unique identifier is retrieved.
setTimeout(() => {
  app.$$SDK.config({
    user_unique_id: 'zhangsan', //Unique user identifier, can be "open_id".
  });
}, 1000);
```
