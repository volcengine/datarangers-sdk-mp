// Copyright 2022 Beijing Volcanoengine Technology Ltd. All Rights Reserved.
import BaseDevice from '../../../plugin/device';

declare const ks;

class Device extends BaseDevice {
  static init(Sdk) {
    Sdk.platform = ks;
  }

  boost() {
    super.boost();
    this.sdk.target = ks;
    this.sdk.targetEnvConfig = null;
    this.sdk.env.set({
      sdk_lib: `mp_common`,
      custom_platform: 'ksMiniProduct',
      mp_platform: 9,
    });
  }

  overlap(res: any, extEnv: Record<string, any>) {
    super.overlap(res, extEnv);
  }
}

export default Device;
