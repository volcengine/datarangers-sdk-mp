// Copyright 2022 Beijing Volcanoengine Technology Ltd. All Rights Reserved.
import type Sdk from '../core/sdk';
import type { TOption } from '../core/option';

class Check {
  static pluginName: string = 'official:check';
  sdk: Sdk;
  options: TOption;
  apply(sdk: Sdk, options: TOption) {
    this.sdk = sdk;
    this.options = options;

    if (this.options.disable_check) {
      return;
    }
    const { types } = this.sdk;
    this.sdk.on(types.Check, ({ type, value }) => {
      if (type === 'event') {
        const event = value;
        if (event.event === 'applog_trace') {
          return;
        }
        const isProfile = event.event?.indexOf('__profile_') === 0;
        if (!isProfile) {
          this.check('name', event.event);
        }
        this.sdk.isObject(event.params) &&
          Object.keys(event.params).forEach((param) => {
            this.check(
              isProfile ? 'profile' : 'param',
              param,
              event.params[param],
            );
          });
      } else if (type === 'config') {
        const otherConfigs = value;
        this.sdk.isObject(otherConfigs) &&
          Object.keys(otherConfigs).forEach((header) => {
            if (header === 'evtParams') {
              const { evtParams } = otherConfigs;
              this.sdk.isObject(evtParams) &&
                Object.keys(evtParams).forEach((evtParam) => {
                  this.check('header', evtParam, evtParams[evtParam]);
                });
            } else {
              this.check('header', header, otherConfigs[header]);
            }
          });
      }
    });
  }

  check(type: string, key: any, val?: any) {
    const keyCheck = (val: string): boolean => {
      return /^[a-zA-Z0-9][a-z0-9A-Z_ .-]{0,255}$/.test(val);
    };
    const valCheck = (val: any): boolean => {
      return String(val).length <= 1024;
    };
    switch (type) {
      case 'name':
        if (!keyCheck(String(key))) {
          this.warn(`event name ${key} illegal`);
        }
        break;
      case 'param':
      case 'header':
      case 'profile': {
        const text =
          type === 'param'
            ? 'event params'
            : type === 'header'
            ? 'config'
            : 'profile';
        if (
          (key === 'profile' ||
            ![
              '$inactive',
              '$inline',
              '$target_uuid_list',
              '$source_uuid',
              '$is_spider',
              '$source_id',
              '$is_first_time',
            ].includes(key)) &&
          !keyCheck(String(key))
        ) {
          this.warn(`${text} name ${key} illegal`);
        }
        if (typeof val === 'string' && !valCheck(val)) {
          this.warn(`the value ${val} length more than 1024 in ${text} ${key}`);
        }
        break;
      }
    }
  }

  warn(text: string) {
    this.sdk.adapter._log?.warn?.(text);
  }
}

export default Check;
