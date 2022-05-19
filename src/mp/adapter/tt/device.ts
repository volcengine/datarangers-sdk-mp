// Copyright 2022 Beijing Volcanoengine Technology Ltd. All Rights Reserved.
import BaseDevice from '../../../plugin/device';

declare const tt;
declare const __ttConfig;

class Device extends BaseDevice {
  static init(Sdk) {
    Sdk.platform = tt;
  }

  boost() {
    super.boost();
    this.sdk.target = tt;
    this.sdk.targetEnvConfig =
      typeof __ttConfig !== 'undefined' ? __ttConfig : null;
    this.sdk.env.set({
      sdk_lib: `mp_common`,
      custom_platform: 'ttMiniProduct',
      mp_platform: 1,
    });
  }

  overlap(res: any, extEnv: Record<string, any>) {
    super.overlap(res, extEnv);
    // extEnv.custom_platform = 'ttMiniProduct';
    // extEnv.mp_platform = 1;
  }
}

export default Device;
