// Copyright 2022 Beijing Volcanoengine Technology Ltd. All Rights Reserved.
import type Sdk from '../core/sdk';
import type { TOption } from '../core/option';

class Device {
  static pluginName: string = 'official:device';
  sdk: Sdk;
  options: TOption;
  apply(sdk: Sdk, options: TOption) {
    this.sdk = sdk;
    this.options = options;
    this.boost();

    const { types } = this.sdk;
    this.getInfo();

    this.sdk.on(types.AppOpen, () => {
      this.getInfo();
    });
  }

  boost() {}

  getInfo() {
    const that = this;
    const { target: which, env } = this.sdk;
    if (which) {
      which.getSystemInfo &&
        which.getSystemInfo({
          success(res) {
            const extEnv: any = {
              device_brand: res.brand, //手机品牌
              device_model: res.model, //手机型号
              os_version: res.system, //操作系统版本
              os_name: res.platform, //客户端平台
              platform: res.platform,
              resolution: `${res.screenWidth}x${res.screenHeight}`, //屏幕分辨率
              screen_width: res.screenWidth, //屏幕宽度
              screen_height: res.screenHeight, //屏幕高度
            };
            that.overlap(res, extEnv);
            env.set(extEnv);
          },
        });

      which.getNetworkType &&
        which.getNetworkType({
          success(res) {
            // 返回网络类型, 有效值：
            // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
            const extEnv = {
              access: res.networkType,
            };
            env.set(extEnv);
          },
        });
    }
  }

  overlap(res: any, extEnv: Record<string, any>) {
    extEnv.language = res.language;
    extEnv.mp_platform_app_version = res.version;
    extEnv.mp_platform_basic_version = res.SDKVersion;
  }
}

export default Device;
