// Copyright 2022 Beijing Volcanoengine Technology Ltd. All Rights Reserved.
import type Sdk from '../core/sdk';
import type { TOption } from '../core/option';

class Analyse {
  static pluginName: string = 'official:analyse';
  sdk: Sdk;
  options: TOption;
  apply(sdk: Sdk, options: TOption) {
    this.sdk = sdk;
    this.options = options;

    if (this.options['verify']) {
      this.sdk.on(this.sdk.types.Verify, ({ eventName, eventParams }) => {
        this.verify(eventName, eventParams);
      });
    }
  }

  verify(eventName: string, eventParams: any) {
    const { option, env, adapter, Domains } = this.sdk;
    const verify = option.get('verify');
    if (
      verify == null ||
      !Array.isArray(verify) ||
      !verify.includes(eventName)
    ) {
      return;
    }
    const sdkInfo = {
      sdk_app_id: this.sdk.appId,
      sdk_channel_domain: option.get('channel_domain'),
      sdk_init: this.sdk.inited,
      sdk_send: this.sdk.sended,
      sdk_ready: this.sdk.ready,
    };
    const user = env.get('user') || {};
    const header = env.get('header') || {};
    const custom = header.custom || {};
    const envInfo = {
      env_webid: user['web_id'],
      env_uuid: user['user_unique_id'],
      env_os_name: header['os_name'],
      env_os_version: header['os_version'],
      env_device_model: header['device_model'],
      env_device_brand: header['device_brand'],
      env_app_version: custom['mp_platform_app_version'],
      env_basic_version: custom['mp_platform_basic_version'],
      env_access: header['access'],
      env_screen_width: header['screen_width'],
      env_screen_height: header['screen_height'],
    };
    const eventInfo = {};
    if (this.sdk.isObject(eventParams)) {
      Object.keys(eventParams).forEach((key) => {
        eventInfo[`event_param_${key}`] = eventParams[key];
      });
    }
    const event = {
      event: 'debug_event',
      params: JSON.stringify({
        event_name: eventName,
        ...eventInfo,
        ...envInfo,
        ...sdkInfo,
      }),
      local_time_ms: +new Date(),
    };
    adapter.request({
      url: `${Domains['cn']}/list/`,
      method: 'POST',
      data: [
        {
          events: [event],
          header: {
            app_id: 258359,
          },
          user: {
            web_id: '7128586842647643661',
            user_id: 'tangseng',
          },
        },
      ],
    });
  }
}

export default Analyse;
