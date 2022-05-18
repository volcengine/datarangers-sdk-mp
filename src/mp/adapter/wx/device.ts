import BaseDevice from '../../../plugin/device';

declare const wx;
declare const __wxConfig;

class Device extends BaseDevice {
  static init(Sdk) {
    Sdk.platform = wx;
  }

  boost() {
    super.boost();
    this.sdk.target = wx;
    this.sdk.targetEnvConfig =
      typeof __wxConfig !== 'undefined' ? __wxConfig : null;
    this.sdk.env.set({
      sdk_lib: `mp_common`,
      custom_platform: 'miniProduct',
      mp_platform: 0,
    });
  }

  overlap(res: any, extEnv: Record<string, any>) {
    super.overlap(res, extEnv);
    // extEnv.custom_platform = 'miniProduct';
    // extEnv.mp_platform = 0;
  }
}

export default Device;
