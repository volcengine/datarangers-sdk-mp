// Copyright 2022 Beijing Volcanoengine Technology Ltd. All Rights Reserved.
import { now } from '../tool/time';
import { isObject } from '../tool/is';
import { safeDecodeURIComponent, unserializeUrl } from '../tool/safe';
import type Sdk from '../core/sdk';
import type { TOption } from '../core/option';

enum UtmStatus {
  Undefined = 0,
  Start = 1,
  End = 2,
}

class Utm {
  static pluginName: string = 'official:utm';
  sdk: Sdk;
  options: TOption;
  key: string = `utm`;
  utmed: UtmStatus = UtmStatus.Undefined;
  reload: boolean = false;
  apply(sdk: Sdk, options: TOption) {
    this.sdk = sdk;
    this.options = options;

    const { types } = this.sdk;

    this.sdk.on(types.LaunchInfo, (info) => {
      if (this.utmed === UtmStatus.Start) {
        return;
      }
      if (this.utmed === UtmStatus.End) {
        this.reload = true;
      }
      this.utmed = UtmStatus.Start;
      this.parseDefault(info?.query ?? {});
      this.parseMore(info?.query ?? {});
    });

    this.sdk.on(types.AppHide, () => {
      this.utmed = UtmStatus.End;
    });
  }

  parseDefault(query: Record<string, any> = {}) {
    let hasUtm = false;
    const utms = Object.keys(query).reduce((result, key) => {
      if (this.sdk.UtmType.includes(key)) {
        hasUtm = true;
        result[key] = safeDecodeURIComponent(query[key]);
      }
      return result;
    }, {});
    if (hasUtm) {
      this.sdk.env.set(utms);
    }
  }

  parseMore(query: Record<string, any> = {}) {
    const {
      tr_token: _trToken = '',
      surl_token: _surlToken = '',
      scene: _scene = '',
    } = query || {};
    let trToken = _trToken || _surlToken;
    if (_scene) {
      const sceneObj = unserializeUrl(safeDecodeURIComponent(`${_scene}`));
      if (sceneObj['tr_token']) {
        trToken = sceneObj['tr_token'];
      }
      this.sdk.set('scene_extra_query', sceneObj);
    }
    if (!trToken) {
      this.dispatch();
      return;
    }
    const callback = () => {
      if (this.reload) {
        this.sdk.emit(this.sdk.types.CancelPause);
      } else {
        this.dispatch();
      }
    };
    if (this.reload) {
      this.sdk.emit(this.sdk.types.Pause);
    }
    this.storageGet(trToken)
      .then((cacheToken) => {
        if (cacheToken) {
          this.sdk.env.set(cacheToken.utms || {});
          callback();
        } else {
          this.fetch(trToken)
            .then(() => callback())
            .catch(() => callback());
        }
      })
      .catch(() => {
        this.fetch(trToken)
          .then(() => callback())
          .catch(() => callback());
      });
  }

  storageGet(trToken: string): Promise<any> {
    const key = this.sdk.getKey(this.key);
    const { adapter } = this.sdk;
    return adapter.get(key).then((cache) => {
      const time = now();
      const expire = 100 * 24 * 3600 * 1000;
      const expireToken = [];
      Object.keys(cache).forEach((each) => {
        if (cache[each] && cache[each].timestamp + expire < time) {
          expireToken.push(each);
        }
      });
      if (expireToken.length > 0) {
        expireToken.forEach((each) => {
          delete cache[each];
        });
        adapter.set(key, cache);
      }
      if (cache && cache[trToken]) {
        return cache[trToken];
      }
      return null;
    });
  }

  storageSet(trToken: string, utms: Record<string, string>) {
    const key = this.sdk.getKey(this.key);
    const { adapter } = this.sdk;
    adapter.get(key).then((cache) => {
      if (!cache) {
        cache = {};
      }
      cache[trToken] = {
        utms,
        timestamp: now(),
      };
      adapter.set(key, cache);
    });
  }

  fetch(trToken: string) {
    const { adapter, option, env, UtmType } = this.sdk;
    return adapter
      .request({
        url: `${option.get('domain')}/service/2/mp_campaigns`,
        method: 'GET',
        data: {
          tr_token: trToken,
        },
        timeout: 3000,
      })
      .then((res) => {
        const { data: { code = -1, data = {}, message = '' } = {} } = res || {};
        if (code === 0) {
          if (isObject(data)) {
            let hasUtm = false;
            const utms = Object.keys(data).reduce((result, each) => {
              if (UtmType.includes(each)) {
                hasUtm = true;
                utms[each] = data[each];
              }
              return result;
            }, {});
            if (hasUtm) {
              env.set(utms);
            }
            this.storageSet(trToken, utms);
          }
        } else if (code === 40002) {
          this.storageSet(trToken, {});
        }
        if (code !== 0) {
          adapter.log(message || '');
        }
      });
  }

  dispatch() {
    this.sdk.emit(this.sdk.types.LaunchComplete);
  }
}

export default Utm;
