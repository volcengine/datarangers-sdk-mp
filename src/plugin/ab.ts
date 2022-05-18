import { now } from '../tool/time';
import { isObject } from '../tool/is';
import type Sdk from '../core/sdk';
import type { TOption } from '../core/option';

const enum FetchStatus {
  No,
  Ing,
  Complete,
}

const enum CallbackType {
  Var,
  All,
}

export const enum CacheType {
  Normal,
  External,
}

type TABItemValue = string | number;

interface IABItem {
  val: TABItemValue;
  vid: string;
}

export interface IABData {
  [key: string]: IABItem;
}

interface ICallback {
  name?: string;
  defaultValue?: any;
  callback: (value: TABItemValue | IABData) => void;
  type: CallbackType;
}

export interface IData {
  ab_version: string[];
  data: IABData;
  timestamp: number;
}

export const DOMAINS = {
  // cn: 'https://toblog.ctobsnssdk.com',
  cn: 'https://abtest.volceapplog.com',
  va: 'https://toblog.itobsnssdk.com',
  sg: 'https://toblog.tobsnssdk.com',
};

class Ab {
  static pluginName: string = 'official:ab';
  sdk: Sdk;
  options: TOption;
  appId: number;
  user: any;
  dataKey: string;
  externalKey: string;
  expire: number = 1 * 30 * 24 * 60 * 60 * 1000;
  domains = DOMAINS;
  domain: string;
  url: string = `/service/2/abtest_config/`;
  message: Record<string, string> = {
    cb: '回调函数必须为一个函数',
    var: '变量名不能为空',
    value: '变量没有默认值',
  };
  fetchStatus: FetchStatus = FetchStatus.No;
  callbacks: ICallback[] = [];
  data: IABData = null;
  versions: string[] = [];
  externalVersions: string | null = null;
  hasOn: boolean = false;
  onHandler: (data: any) => void = () => {};
  changeListener: Map<any, any> = new Map();
  exposureName: string = `abtest_exposure`;
  clear: boolean = false;

  apply(sdk: Sdk, options: TOption) {
    this.sdk = sdk;
    this.options = options;

    const { adapter, types, appId } = this.sdk;
    this.appId = appId;
    this.externalKey = this.sdk.getKey(`ab_version_external`);

    this.sdk.on(types.AbExternalVersion, (vids) => {
      this.processExternal(vids);
      const { adapter } = this.sdk;
      if (vids) {
        adapter.set(this.externalKey, vids);
      } else {
        adapter.remove(this.externalKey);
      }
    });

    adapter.get(this.externalKey).then((vids) => {
      if (!vids) {
        return;
      }
      try {
        this.processExternal(vids);
      } catch (e) {}
    });

    if (!this.options.enable_ab_test) {
      return;
    }

    this.dataKey = this.sdk.getKey(`ab_version`);
    this.clear = this.options.clear_ab_cache_on_user_change;
    this.domain = this.getDomain();

    this.sdk.on(types.UuidChangeAfter, () => {
      if (!this.sdk.ready) {
        return;
      }
      if (this.clear) {
        this.versions = [];
        this.data = {};
        this.updateVersions();
        this.emitChange();
      }
    });

    this.sdk.once(types.Ready, () => {
      this.preFetch();

      this.sdk.on(types.UuidChangeAfter, () => {
        this.preFetch();
      });
    });

    this.sdk.on(types.AbVar, ({ name, defaultValue, callback }) => {
      this.getVar(name, defaultValue, callback);
    });

    this.sdk.on(types.AbAllVars, (callback) => {
      this.getAllVars(callback);
    });

    this.sdk.on(types.AbVersionChangeOn, (cb: (versions: string) => void) => {
      this.changeListener.set(cb, cb);
    });

    this.sdk.on(types.AbVersionChangeOff, (cb: (versions: string) => void) => {
      if (this.changeListener.get(cb)) {
        this.changeListener.delete(cb);
      }
    });

    this.sdk.on(types.AbRefresh, ({ params, callback }) => {
      this.preFetch(params, callback);
    });

    adapter.get(this.dataKey).then((data) => {
      if (!data) {
        return;
      }
      const current = data.timestamp;
      if (now() - current >= this.expire) {
        this.sdk.adapter.remove(this.dataKey);
        return;
      }
      try {
        const { ab_version: versions, data: cacheData } = data;
        if (this.fetchStatus !== FetchStatus.Complete) {
          this.versions = versions || [];
          this.data = cacheData;
          this.configVersions();
        }
      } catch (e) {}
    });
  }

  private output(tip: string) {
    this.sdk.adapter.log(tip);
  }

  private processExternal(vids: string | null) {
    this.externalVersions = vids;
    this.sdk.set('ab_sdk_version_external', vids);
  }

  getAllVars(callback: (data: IABData) => void) {
    if (typeof callback !== 'function') {
      return this.output(this.message.cb);
    }
    const callbackObj = {
      callback,
      type: CallbackType.All,
    };
    if (this.fetchStatus === FetchStatus.Complete) {
      this._getAllVars(callbackObj);
    } else {
      this.callbacks.push(callbackObj);
    }
  }

  getVar(
    name: string,
    defaultValue: any,
    callback: (value: TABItemValue) => void,
  ) {
    if (!name) {
      return this.output(this.message.var);
    }
    if (defaultValue === undefined) {
      return this.output(this.message.value);
    }
    if (typeof callback !== 'function') {
      return this.output(this.message.cb);
    }
    const callbackObj = {
      name,
      defaultValue,
      callback: (value: TABItemValue) => {
        try {
          callback(value);
        } catch (e) {}
      },
      type: CallbackType.Var,
    };
    if (this.fetchStatus === FetchStatus.Complete) {
      this._getVar(callbackObj);
    } else {
      this.callbacks.push(callbackObj);
    }
  }

  private fetchComplete(data: IABData | null) {
    if (data) {
      this.data = data;
      const versions = [];
      Object.keys(data).forEach((key) => {
        const { vid } = data[key];
        if (vid) {
          versions.push(vid);
        }
      });
      const beforeLength = this.versions.length;
      if (beforeLength) {
        this.versions = this.versions.filter((vid) => versions.includes(vid));
        if (this.versions.length !== beforeLength) {
          this.updateVersions();
        }
      } else {
        this.updateVersions();
      }
    }
    this.callbacks.forEach((item) =>
      this[item.type === CallbackType.Var ? '_getVar' : '_getAllVars'](item),
    );
    this.callbacks = [];
  }

  private _getAllVars(item: ICallback) {
    const { callback } = item;
    callback(this.data ? JSON.parse(JSON.stringify(this.data)) : {});
  }

  private _getVar(item: ICallback) {
    const { name, defaultValue, callback } = item;
    const { data } = this;
    if (!data) {
      callback(defaultValue);
      return;
    }
    if (isObject(data[name])) {
      const { vid, val } = data[name];
      if (vid) {
        if (!this.versions.includes(vid)) {
          this.versions.push(vid);
          this.updateVersions();
          this.emitChange();
        }
        this.sdk.emit(this.sdk.types.Event, {
          ...this.sdk.createEvent(
            {
              event: this.exposureName,
            },
            false,
          ),
          ab_sdk_version: vid,
        });
      }
      callback(val);
      return;
    }
    callback(defaultValue);
  }

  private updateVersions() {
    this.configVersions();
    this.sdk.adapter.set(this.dataKey, {
      data: this.data,
      ab_version: this.versions,
      timestamp: now(),
    });
  }

  private configVersions() {
    const abVersions = this.versions.join(',');
    this.sdk.set('ab_sdk_version', abVersions);
    const key = 'ab_versions';
    this.sdk.set(key, [
      ...(this.sdk.get(key) || []),
      {
        time: now(),
        ab: abVersions,
      },
    ]);
  }

  private emitChange() {
    const abVersions = this.versions.join(',');
    this.changeListener.size > 0 &&
      this.changeListener.forEach((listener) => {
        if (typeof listener === 'function') {
          setTimeout(() => {
            try {
              listener(abVersions);
            } catch (e) {}
          }, 0);
        }
      });
  }

  private getDomain(): string {
    const {
      channel_domain: channelDomain,
      ab_channel_domain: abChannelDomain,
    } = this.options;
    const { option } = this.sdk;
    const defaultReportChannel = option.get('cloneOption')?.['report_channel'];
    let reportPrefix = '';
    if (abChannelDomain) {
      reportPrefix = abChannelDomain;
    } else if (channelDomain) {
      reportPrefix = channelDomain;
    } else {
      let { report_channel: reportChannel } = this.options;
      const keys = Object.keys(this.domains);
      if (!keys.includes(reportChannel)) {
        reportChannel = defaultReportChannel;
      }
      reportPrefix = this.domains[reportChannel];
    }
    return reportPrefix;
  }

  private preFetch(
    params: Record<string, any> = {},
    callback?: (value: any) => void,
  ) {
    if (!this.domain) {
      this.fetchStatus = FetchStatus.Complete;
      this.fetchComplete(null);
      callback && callback(null);
      return;
    }
    const { env } = this.sdk;
    const { user, header } = env.get();
    const { headers, ...others } = header;
    this.user = { ...user };
    this.fetch({
      ...others,
      ...headers,
      ...(params || {}),
    }).then((value) => callback && callback(value));
  }

  private fetch(env: any): Promise<any> {
    this.fetchStatus = FetchStatus.Ing;
    const { user_unique_id: uuid } = this.user;
    return this.sdk.adapter
      .request({
        url: `${this.domain}${this.url}`,
        method: 'POST',
        data: {
          header: {
            aid: this.appId,
            ...(this.user || {}),
            ...(env || {}),
          },
        },
      })
      .then((response) => {
        if (this.user.user_unique_id !== uuid) {
          return null;
        }
        this.fetchStatus = FetchStatus.Complete;
        const data = response?.data?.data;
        this.sdk.emit(this.sdk.types.AbFetchAfter, data);
        this.fetchComplete(data);
        return data;
      })
      .catch(() => {
        this.fetchStatus = FetchStatus.Complete;
        this.fetchComplete(null);
        return null;
      });
  }
}

export default Ab;
