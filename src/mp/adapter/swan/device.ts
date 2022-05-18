import BaseDevice from '../../../plugin/device';

declare const swan;

class Device extends BaseDevice {
  static init(Sdk) {
    Sdk.platform = swan;
  }

  boost() {
    super.boost();
    this.sdk.target = swan;
    this.sdk.targetEnvConfig = null;
    this.sdk.env.set({
      sdk_lib: `mp_common`,
      custom_platform: 'swanMiniProduct',
      mp_platform: 5,
    });
  }

  overlap(res: any, extEnv: Record<string, any>) {
    super.overlap(res, extEnv);
    // extEnv.custom_platform = 'swanMiniProduct';
    // extEnv.mp_platform = 5;
  }
}

export default Device;
