import { timezone } from '../tool/time';
import type Sdk from '../core/sdk';
import type { TOption } from '../core/option';

class Transform {
  static pluginName: string = 'official:transform';
  sdk: Sdk;
  options: TOption;
  apply(sdk: Sdk, options: TOption) {
    this.sdk = sdk;
    this.options = options;

    const { types, env } = this.sdk;
    const tz = timezone();
    env.set({
      timezone: tz.timezone,
      tz_offset: tz.offset,
    });

    this.sdk.on(types.ConfigTransform, (configs) => {
      if (typeof configs.gender !== 'undefined') {
        if ([1, 2, '1', '2'].includes(configs.gender)) {
          configs.gender = configs.gender < 2 ? 'male' : 'female';
        } else {
          delete configs.gender;
        }
      }

      const enableProfile = !!this.options.enable_profile;
      if (enableProfile) {
        const info = {};
        ['nick_name', 'gender', 'avatar_url'].forEach((each) => {
          if (typeof configs[each] !== 'undefined') {
            info[each] = configs[each];
            delete configs[each];
          }
        });
        this.sdk.emit(types.ProfileSet, info);
      }
    });

    this.sdk.on(types.EnvTransform, (configs) => {
      const enableProfile = !!this.options.enable_profile;
      if (enableProfile) {
        const info = {};
        ['$mp_from_uuid'].forEach((each) => {
          if (typeof configs[each] !== 'undefined') {
            info[each] = configs[each];
            delete configs[each];
          }
        });
        Object.keys(info).length > 0 &&
          this.sdk.emit(types.ProfileSetOnce, info);
      }
    });
  }
}

export default Transform;
