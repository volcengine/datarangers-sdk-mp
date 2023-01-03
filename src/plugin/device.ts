// Copyright 2022 Beijing Volcanoengine Technology Ltd. All Rights Reserved.
import type Sdk from '../core/sdk';
import type { TOption } from '../core/option';

declare var setTimeout;

class Device {
  static pluginName: string = 'official:device';
  sdk: Sdk;
  options: TOption;
  timer: number = 0;
  apply(sdk: Sdk, options: TOption) {
    this.sdk = sdk;
    this.options = options;
    this.boost();

    const { types } = this.sdk;
    this.getInfo();

    this.sdk.on(types.AppOpen, () => {
      this.getInfo(true);
      this.onChange();
    });
  }

  boost() {}

  getInfo(isRepeat: boolean = false) {
    const { target: which } = this.sdk;
    if (which) {
      this.system(which);
      this.network(which);
      !isRepeat && this.info(which);
    }
  }

  system(which: any) {
    const that = this;
    const { env } = this.sdk;
    which.getSystemInfo &&
      which.getSystemInfo({
        success(res) {
          const width = Math.ceil(res.screenWidth);
          const height = Math.ceil(res.screenHeight);
          const extEnv: any = {
            device_brand: res.brand, //手机品牌
            device_model: res.model, //手机型号
            os_version: res.system, //操作系统版本
            os_name: res.platform, //客户端平台
            platform: res.platform,
            resolution: `${width}x${height}`, //屏幕分辨率
            screen_width: width, //屏幕宽度
            screen_height: height, //屏幕高度
          };
          that.overlap(res, extEnv);
          env.set(extEnv);
        },
      });
  }

  network(which: any) {
    const that = this;
    const { env, types } = this.sdk;
    which.getNetworkType &&
      which.getNetworkType({
        success(res) {
          // 返回网络类型, 有效值：
          // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
          const extEnv = {
            access: res.networkType,
            is_connected:
              typeof res.networkAvailable !== 'undefined'
                ? !!res.networkAvailable
                : res.networkType !== 'none',
          };
          if (!that.options.enable_skip_network) {
            that.sdk.emit(types.Network, {
              origin: env.get('is_connected'),
              current: extEnv.is_connected,
            });
          }
          env.set(extEnv);
        },
        fail() {
          if (that.timer > 0) {
            return;
          }
          that.timer = setTimeout(() => {
            that.network(which);
          }, 50);
        },
      });
  }

  info(which: any) {
    try {
      if (which.getAccountInfoSync) {
        const {
          miniProgram: { appId, envVersion, version },
        } = which.getAccountInfoSync() || {};
        this.sdk.env.set({
          app_version: version,
          miniprogram_appid: appId,
          miniprogram_version: version,
          miniprogram_env_version: envVersion,
        });
      } else if (which.getEnvInfoSync) {
        const {
          microapp: { appId, envType, mpVersion },
        } = which.getEnvInfoSync() || {};
        this.sdk.env.set({
          app_version: mpVersion,
          miniprogram_appid: appId,
          miniprogram_version: mpVersion,
          miniprogram_env_version: envType,
        });
      }
    } catch (e) {}
  }

  onChange() {
    const { target: which, env, types } = this.sdk;
    which?.onNetworkStatusChange?.((res) => {
      if (!this.options.enable_skip_network) {
        this.sdk.emit(types.Network, {
          origin: env.get('is_connected'),
          current: res?.isConnected,
        });
      }
      env.set({
        access: res?.networkType,
        is_connected: res?.isConnected,
      });
    });
  }

  overlap(res: any, extEnv: Record<string, any>) {
    extEnv.language = res.language;
    extEnv.mp_platform_app_version = res.version;
    extEnv.mp_platform_basic_version = res.SDKVersion;
  }
}

export default Device;
