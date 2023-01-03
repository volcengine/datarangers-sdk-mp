// Copyright 2022 Beijing Volcanoengine Technology Ltd. All Rights Reserved.
import BaseDevice from '../../../plugin/device';

declare const jd;

class Device extends BaseDevice {
  static init(Sdk) {
    Sdk.platform = jd;
  }

  boost() {
    super.boost();
    this.sdk.target = jd;
    this.sdk.targetEnvConfig = null;
    this.sdk.env.set({
      sdk_lib: `mp_common`,
      custom_platform: 'jdMiniProduct',
      mp_platform: 8,
    });
  }

  overlap(res: any, extEnv: Record<string, any>) {
    super.overlap(res, extEnv);
    extEnv.mp_platform_basic_version = jd.SDKVersion || res.version;
  }
}

export default Device;
