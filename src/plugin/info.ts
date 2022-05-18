import type Sdk from '../core/sdk';
import type { TOption } from '../core/option';

declare const process;
const SDK_VERSION = process.env.SDK_VERSION;
const SDK_NAME = process.env.SDK_NAME;

class Info {
  static pluginName: string = 'official:info';
  apply(sdk: Sdk, options: TOption) {
    sdk.env.set({
      sdk_version: SDK_VERSION || '0.0.0',
      _sdk_version: SDK_VERSION || '0.0.0',
      _sdk_name: SDK_NAME,
    });
  }
}

export default Info;
