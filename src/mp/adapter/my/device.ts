import BaseDevice from '../../../plugin/device';

declare const my;

class Device extends BaseDevice {
  static init(Sdk) {
    Sdk.platform = my;
  }

  boost() {
    super.boost();
    this.sdk.target = my;
    this.sdk.targetEnvConfig = null;
    this.sdk.env.set({
      sdk_lib: `mp_common`,
      custom_platform: 'aliMiniProduct',
      mp_platform: 1,
    });
  }

  overlap(res: any, extEnv: Record<string, any>) {
    super.overlap(res, extEnv);
    // extEnv.custom_platform = 'aliMiniProduct';
    // extEnv.mp_platform = 1;
    extEnv.mp_platform_basic_version = my.SDKVersion || res.version;
  }
}

export default Device;
