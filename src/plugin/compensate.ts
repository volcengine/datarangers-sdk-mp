// Copyright 2022 Beijing Volcanoengine Technology Ltd. All Rights Reserved.
import { now } from '../tool/time';
import type Sdk from '../core/sdk';
import type { TOption } from '../core/option';

class Compensate {
  static pluginName: string = 'official:compensate';
  sdk: Sdk;
  options: TOption;
  key: string = `compensate`;
  keyCache: string[] = [];
  reportUrl: string;
  batchMax: number = 5;
  cacheBatchNumber: number = 15;
  enable: boolean = false;
  unReadyKeys: Record<string, number> = {};
  bufferKeys: Record<string, number> = {};
  errorKeys: Record<string, number> = {};
  bufferPreKey: string = '';
  errorPreKey: string = '';
  hasKey: boolean = false;
  startTime: number = 0;
  closeTime: number = 0;
  closeTimeMax: number = 3000;
  apply(sdk: Sdk, options: TOption) {
    this.sdk = sdk;
    this.options = options;

    this.enable = !!this.options.enable_cache;
    if (!this.enable) {
      return;
    }

    this.reportUrl = this.sdk.get('report_url');
    this.bufferPreKey = this.sdk.getKey('buffer');
    this.errorPreKey = this.sdk.getKey('compensate');

    const { types } = this.sdk;

    this.sdk.on(types.AppShow, () => {
      if (!this.hasKey) {
        this.getKeys().then(() => {
          this.hasKey = true;
          if (this.sdk.ready && this.network()) {
            this.nowReport();
          }
        });
      } else {
        if (this.sdk.ready && this.network()) {
          this.nowReport();
        }
      }
    });

    this.sdk.on(types.Ready, () => {
      if (!this.hasKey) {
        this.getKeys().then(() => {
          this.hasKey = true;
          if (this.network()) {
            this.nowReport();
          }
        });
      } else {
        if (this.network()) {
          this.nowReport();
        }
      }
    });

    this.sdk.on(types.Network, (networkStatus) => {
      if (networkStatus.current && this.sdk.ready) {
        this.nowReport();
      }
    });

    this.sdk.on(types.AppClose, () => {
      this.closeTime = now();
      try {
        ['unReadyKeys', 'bufferKeys', 'errorKeys'].forEach((name) => {
          Object.keys(this[name]).forEach((key) => {
            if (this[name][key] === 2) {
              delete this[name][key];
            }
          });
        });
      } catch (e) {}

      if (this.options.enable_trace) {
        this.logSdkStatus();
      }
    });

    this.sdk.on(types.SubmitError, (info) => {
      const { event } = info;
      this.storageError(event).then((key) => {
        this.errorKeys[key] = 0;
      });
    });

    this.sdk.on(types.CacheUnReady, (cache) => {
      const length = cache.length;
      if (length > 0) {
        const key = `${this.bufferPreKey}_unready_`;
        const retryReport = (key: string, data: any) => {
          const eventData = [this.sdk.env.compose(data)];
          const submit = () => {
            if (now() - this.closeTime > this.closeTimeMax) {
              return;
            }
            this.unReadyKeys[key] = 1;
            this.report(eventData)
              .then(() => {
                this.unReadyKeys[key] = 2;
                this.sRemove(key);
              })
              .catch(() => {
                this.unReadyKeys[key] = 0;
              });
          };
          if (this.sdk.ready) {
            submit();
          } else {
            this.sdk.once(types.Ready, () => {
              submit();
            });
          }
        };
        if (length > this.cacheBatchNumber) {
          const clone = [...cache];
          while (clone.length > 0) {
            const data = clone.splice(0, this.cacheBatchNumber);
            if (data.length > 0) {
              const k = key + this.random();
              this.sSet(k, data).then(() => {
                this.unReadyKeys[k] = 0;
                if (this.options.enable_retry_unready) {
                  retryReport(k, data);
                }
              });
            }
          }
        } else {
          const k = key + this.random();
          this.sSet(k, cache).then(() => {
            this.unReadyKeys[k] = 0;
            if (this.options.enable_retry_unready) {
              retryReport(k, cache);
            }
          });
        }
      }
    });

    this.sdk.on(types.CacheBuffer, (cache) => {
      const key = `${this.bufferPreKey}_buffer_` + this.random();
      this.sSet(key, cache).then(() => {
        this.bufferKeys[key] = 0;
      });
    });
  }

  getKeys() {
    const { adapter } = this.sdk;
    return adapter.storageInfo().then((info) => {
      if (info?.keys) {
        const { keys } = info;
        Array.isArray(keys) &&
          keys.forEach((key) => {
            if (key.indexOf(`${this.bufferPreKey}_unready`) === 0) {
              if (typeof this.unReadyKeys[key] === 'undefined') {
                this.unReadyKeys[key] = 0;
              }
            } else if (key.indexOf(`${this.bufferPreKey}_buffer`) === 0) {
              if (typeof this.bufferKeys[key] === 'undefined') {
                this.bufferKeys[key] = 0;
              }
            } else if (key.indexOf(`${this.errorPreKey}`) === 0) {
              if (typeof this.errorKeys[key] === 'undefined') {
                this.errorKeys[key] = 0;
              }
            }
          });
      }
    });
  }

  nowReport() {
    this.unReadyReport();
    this.bufferReport();
    this.errorReport();
  }

  unReadyReport() {
    this.batchReport(this.unReadyKeys, true);
  }

  bufferReport() {
    this.batchReport(this.bufferKeys, false);
  }

  errorReport() {
    this.batchReport(this.errorKeys, false);
  }

  batchReport(thisKeys: Record<string, number>, needCompose: boolean = false) {
    const filterKeys = Object.keys(thisKeys).filter((key) => {
      return thisKeys[key] === 0;
    });
    if (filterKeys.length === 0) {
      return;
    }
    if (filterKeys.length <= 3) {
      filterKeys.forEach((key) => {
        thisKeys[key] = 1;
        this.byKey(thisKeys, key, needCompose);
      });
    } else {
      const clone = [...filterKeys];
      let index = 0;
      while (clone.length > 0) {
        const keys = clone.splice(0, 3);
        if (keys.length > 0) {
          keys.forEach((key) => {
            thisKeys[key] = 1;
          });
          setTimeout(() => {
            keys.forEach((key) => {
              this.byKey(thisKeys, key, needCompose);
            });
          }, index * 150);
        }
        index++;
      }
    }
  }

  byKey(thisKeys: Record<string, number>, key: string, needCompose: boolean) {
    this.sGet(key)
      .then((evts) => {
        if (!evts) {
          thisKeys[key] = 2;
          return;
        }
        const eventData = needCompose ? [this.sdk.env.compose(evts)] : evts;
        this.report(eventData)
          .then(() => {
            thisKeys[key] = 2;
            this.sRemove(key);
          })
          .catch(() => {
            thisKeys[key] = 0;
          });
      })
      .catch(() => {
        thisKeys[key] = 0;
      });
  }

  report(data) {
    if (!this.reportUrl) {
      this.reportUrl = this.sdk.get('report_url');
      if (!this.reportUrl) {
        return Promise.reject();
      }
    }
    return this.sdk.adapter.request({
      url: this.reportUrl,
      method: 'POST',
      data,
    });
  }

  storageError(data: any): Promise<string> {
    const key = `${this.errorPreKey}_` + this.random();
    return this.sSet(key, data).then(() => key);
  }

  sGet(key: string): Promise<any> {
    const { adapter } = this.sdk;
    return adapter.get(key).then((cache) => {
      if (!this.sdk.isObject(cache) || !cache.timestamp) {
        adapter.remove(key);
        return null;
      }
      const time = now();
      const expire = 7 * 24 * 3600 * 1000;
      if (cache.timestamp + expire < time) {
        adapter.remove(key);
        return null;
      }
      return cache.data;
    });
  }

  sSet(key: string, data: any): Promise<boolean> {
    const { adapter } = this.sdk;
    return adapter.set(key, {
      data,
      timestamp: now(),
    });
  }

  sRemove(key: string): Promise<boolean> {
    return this.sdk.adapter.remove(key);
  }

  private random() {
    return `${+new Date()}_${Math.floor(Math.random() * 100000)}`;
  }

  private logSdkStatus() {
    const { env } = this.sdk;
    const webId = env.get('web_id');
    const uuid = env.get('user_unique_id');
    const event = this.sdk.createEvent({
      event: 'sdk_status_log',
      params: {
        duration: now() - this.startTime,
        aid: this.sdk.appId,
        init: this.sdk.inited,
        send: this.sdk.sended,
        ready: this.sdk.ready,
        webid: webId,
        uuid,
      },
    });
    const eventData = env.compose([event]);
    eventData.header.app_id = 666666;
    if (!webId) {
      eventData.user.web_id = new Array(25).fill(8).join('');
      eventData.user.user_unique_id = `__zhangxiaofan__`;
    }
    return this.report([eventData]);
  }

  private network(): boolean {
    if (this.options.enable_skip_network) {
      return true;
    }
    return !!this.sdk.env.get('is_connected');
  }
}

export default Compensate;
