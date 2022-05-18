import BaseDevice from '../../../plugin/device';

declare const uni;

class Device extends BaseDevice {
  static init(Sdk) {
    Sdk.platform = uni;
  }

  boost() {
    super.boost();
    this.sdk.target = uni;
    this.sdk.targetEnvConfig = null;
    this.sdk.env.set({
      sdk_lib: `mp_common`,
      custom_platform: 'uniMiniProduct',
      mp_platform: 7,
    });
  }

  overlap(res: any, extEnv: Record<string, any>) {
    super.overlap(res, extEnv);
    // extEnv.custom_platform = 'uniMiniProduct';
    // extEnv.mp_platform = 7;
  }
}

export default Device;
