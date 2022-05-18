import BaseDevice from '../../../plugin/device';
import { getWhich } from './which';

class Device extends BaseDevice {
  which: any;

  static init(Sdk) {
    const which = getWhich();
    Sdk.platform = which.is ? which.target : null;
    Sdk.platformIs = which.is;
  }

  boost() {
    super.boost();
    this.which = getWhich();
    this.sdk.target = this.which.target;
    this.sdk.targetEnvConfig = this.which.config;
    this.sdk.env.set({
      sdk_lib: `mp_common`,
      custom_platform: this.which.customPlatform,
      mp_platform: this.which.mpPlatform,
    });
  }

  overlap(res: any, extEnv: Record<string, any>) {
    super.overlap(res, extEnv);
    // extEnv.custom_platform = this.which.customPlatform;
    // extEnv.mp_platform = this.which.mpPlatform;
  }
}

export default Device;
