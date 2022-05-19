// Copyright 2022 Beijing Volcanoengine Technology Ltd. All Rights Reserved.
import BaseDevice from '../../../plugin/device';

declare const qq;
declare const __qqConfig;

class Device extends BaseDevice {
  static init(Sdk) {
    Sdk.platform = qq;
  }

  boost() {
    super.boost();
    this.sdk.target = qq;
    this.sdk.targetEnvConfig =
      typeof __qqConfig !== 'undefined' ? __qqConfig : null;
    this.sdk.env.set({
      sdk_lib: `mp_common`,
      custom_platform: 'qqMiniProduct',
      mp_platform: 6,
    });
  }

  overlap(res: any, extEnv: Record<string, any>) {
    super.overlap(res, extEnv);
    // extEnv.custom_platform = 'qqMiniProduct';
    // extEnv.mp_platform = 6;
  }
}

export default Device;
