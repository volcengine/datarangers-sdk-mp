import type Sdk from '../core/sdk';
import type { TOption } from '../core/option';

class Robot {
  static pluginName: string = 'official:robot';
  sdk: Sdk;
  options: TOption;
  scenes: number[] = [1129];
  apply(sdk: Sdk, options: TOption) {
    this.sdk = sdk;
    this.options = options;
    if (!this.options.enable_filter_crawler) {
      return;
    }

    const { target, types } = this.sdk;
    const check = (info) => {
      if (this.scenes.includes(info?.scene)) {
        this.sdk.set('is-crawler', true);
      }
    };
    try {
      if (target.getLaunchOptionsSync) {
        const info = target.getLaunchOptionsSync();
        check(info);
      }
    } catch (e) {}

    this.sdk.on(types.AppOpen, (info) => {
      check(info);
    });
  }
}

export default Robot;
