import { now } from '../tool/time';
import { isObject } from '../tool/is';
import type Sdk from '../core/sdk';
import type { TOption } from '../core/option';

class Compensate {
  static pluginName: string = 'official:compensate';
  sdk: Sdk;
  options: TOption;
  key: string = `compensate`;
  cache: Map<string, any> = new Map();
  reportUrl: string;
  batchMax: number = 10;
  enable: boolean = false;
  storageCache: Map<string, any> = new Map();
  apply(sdk: Sdk, options: TOption) {
    this.sdk = sdk;
    this.options = options;

    this.reportUrl = this.sdk.get('report_url');
    this.enable = this.sdk.get('enable_storage');
    if (!!this.options.enable_storage_only) {
      this.enable = true;
    }

    const { types } = this.sdk;
    if (this.enable) {
      this.sdk.on(types.Ready, () => {
        this.storageGet().then((data) => {
          if (!this.reportUrl || !data || !Array.isArray(data)) {
            return;
          }
          const report = (data: any): Promise<any> => {
            return new Promise((resolve) => {
              this.sdk.adapter
                .request({
                  url: this.reportUrl,
                  method: 'POST',
                  data,
                })
                .then(() => {
                  resolve(null);
                })
                .catch(() => {
                  resolve(null);
                });
            });
          };
          if (data.length > 50) {
            const clone = [...data];
            const loop = () => {
              const spliceData = clone.splice(0, 50);
              if (spliceData.length > 0) {
                report(spliceData).then(() => {
                  if (clone.length > 0) {
                    loop();
                  }
                });
              }
            };
            loop();
          } else {
            report(data);
          }
        });
      });
    }

    this.sdk.on(types.SubmitError, (info) => {
      const randomKey = this.random();
      const { event } = info;
      this.cache.set(randomKey, event);
      this.process();
    });

    this.sdk.on(types.AppClose, () => {
      this.report();
    });
  }

  process() {
    if (this.cache.size >= this.batchMax) {
      this.report();
    }
  }

  report() {
    if (!this.reportUrl) {
      this.reportUrl = this.sdk.get('report_url');
      if (!this.reportUrl) {
        return;
      }
    }
    let data = [];
    this.cache.forEach((item) => {
      data = [...data, ...item];
    });
    if (data.length > 0) {
      const randomKey = this.random();
      if (this.enable) {
        this.storageCache.set(randomKey, data);
      }
      this.sdk.adapter
        .request({
          url: this.reportUrl,
          method: 'POST',
          data,
        })
        .then(() => {
          if (this.enable) {
            this.storageCache.delete(randomKey);
          }
        })
        .catch(() => {
          if (this.enable) {
            let data = [];
            this.storageCache.forEach((item) => {
              data = [...data, ...item];
            });
            this.storageSet(data);
          }
        });
      this.cache = new Map();
    }
  }

  storageGet(): Promise<any> {
    const key = this.sdk.getKey(this.key);
    const { adapter } = this.sdk;
    return adapter.get(key).then((cache) => {
      adapter.remove(key);
      if (!isObject(cache) || !cache.timestamp) {
        return null;
      }
      const time = now();
      const expire = 100 * 24 * 3600 * 1000;
      if (cache.timestamp + expire < time) {
        return null;
      }
      return cache.data;
    });
  }

  storageSet(data: any) {
    const key = this.sdk.getKey(this.key);
    const { adapter } = this.sdk;
    adapter.set(key, {
      data,
      timestamp: now(),
    });
  }

  private random() {
    return `${+new Date()}_${Math.floor(Math.random() * 10000000000)}`;
  }
}

export default Compensate;
