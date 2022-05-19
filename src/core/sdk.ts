// Copyright 2022 Beijing Volcanoengine Technology Ltd. All Rights Reserved.
import Env from './env';
import Option from './option';
import Hook from './hook';
import Adapter from './adapter';
import Types from './type';
import { EventType, ProfileType, UtmType } from './constant';
import { isObject, isNumber, isString } from '../tool/is';
import uuid from '../tool/uuid';
import { now } from '../tool/time';
import type { TEnv } from './env';
import type { TOption } from './option';
import type { THook, THookInfo } from './hook';
import type { AdapterLog, AdapterRequest, AdapterStorage } from './adapter';
export interface Plugin {
  apply(sdk: Sdk, options: TOption): void;
}
export interface PluginConstructor {
  new (): Plugin;
  pluginName?: string;
  init?(Sdk: SdkConstructor): void;
}

type InitParams = { app_id: number } & Partial<TOption>;

type ConfigParams = {
  _staging_flag?: number | boolean;
  evtParams?: Record<string, any>;
  [key: string]: any;
};

export type EventParams = Record<string, any>;
export type TEvent = {
  event: string;
  params?: EventParams;
  local_time_ms?: number;
  session_id?: string;
};
export type TEventOuter = Omit<TEvent, 'session_id'>;
export type TEventData = {
  events: TEvent[];
  local_time?: number;
} & TEnv;

export type ProfileParams = {
  [key: string]: string | number | boolean | Array<any>;
};
export type ProfileIncrementParams = {
  [key: string]: number;
};

interface SdkConstructor {
  new (): Sdk;
  instances: Array<Sdk>;
  useAdapterLog: (adapter: AdapterLog) => void;
  useAdapterRequest: (adapter: AdapterRequest) => void;
  useAdapterStorage: (adapter: AdapterStorage) => void;
  usePlugin: (plugin: PluginConstructor, name?: string) => void;
}

class Sdk {
  public env: Env;
  public option: Option;
  private hook: Hook;
  public adapter: Adapter;
  public types: typeof Types = Types;
  public EventType = EventType;
  public ProfileType = ProfileType;
  public UtmType = UtmType;
  public SdkHook = Types;

  private static _log: AdapterLog;
  private static _request: AdapterRequest;
  private static _storage: AdapterStorage;
  private static plugins: Array<{
    plugin: PluginConstructor;
    name?: string;
  }> = [];
  public static instances: Array<Sdk> = [];
  public static platform: any;
  public static platformIs: string;

  private inited: boolean = false;
  private sended: boolean = false;
  private _appId: number;

  protected pluginInstances: Array<Plugin> = [];
  private data: Map<string, any> = new Map();

  public target: any;
  public targetEnvConfig: any;
  public whichIs: string;

  public ready: boolean = false;
  public sessionId: string = '';

  constructor() {
    this.env = new Env(this);
    this.option = new Option();
    this.hook = new Hook();
    Sdk.instances.push(this);

    try {
      this.adapter = new Adapter(this);
      this.adapter.setLog(Sdk._log);
      this.adapter.setRequest(Sdk._request);
      this.adapter.setStorage(Sdk._storage);
      this.adapter.check();

      Sdk.plugins.reduce((result, plugin) => {
        const { plugin: P } = plugin;
        result.push(new P());
        return result;
      }, this.pluginInstances);
    } catch (e) {}
  }

  on(type: string, hook: THook) {
    this.hook?.on(type, hook);
  }

  once(type: string, hook: THook) {
    this.hook?.once(type, hook);
  }

  off(type: string, hook?: THook) {
    if (!hook && this.types[type]) {
      return;
    }
    this.hook?.off(type, hook);
  }

  emit(type: string, info?: THookInfo) {
    this.adapter.log(`emit ${type}`, info || '');
    this.hook?.emit(type, info);
  }

  static useAdapterLog(adapter: AdapterLog) {
    Sdk._log = adapter;
  }

  static useAdapterRequest(adapter: AdapterRequest) {
    Sdk._request = adapter;
  }

  static useAdapterStorage(adapter: AdapterStorage) {
    Sdk._storage = adapter;
  }

  static usePlugin(plugin: PluginConstructor, pluginName?: string) {
    const name = pluginName || plugin.pluginName;
    if (name) {
      let check = false;
      for (let i = 0, len = Sdk.plugins.length; i < len; i++) {
        const p = Sdk.plugins[i];
        if (p.name === name) {
          Sdk.plugins[i].plugin = plugin;
          check = true;
          break;
        }
      }
      if (!check) {
        Sdk.plugins.push({ name, plugin });
      }
    } else {
      Sdk.plugins.push({ plugin });
    }
    if (typeof plugin.init === 'function') {
      try {
        plugin.init(Sdk);
      } catch (e) {}
    }
  }

  get appId(): number {
    return this._appId;
  }

  checkUsePlugin(name: string): boolean {
    return !!Sdk.plugins.find(({ name: n }) => n === name);
  }

  init(options: InitParams) {
    if (this.inited || !isObject(options)) {
      return;
    }
    const { app_id: appId, log, ...otherOptions } = options;

    if (log !== undefined) {
      this.option.set({
        log,
      });
    }

    if (!isNumber(appId) || !(appId > 0)) {
      this.adapter.log(`app_id invalid`);
      return;
    }
    this._appId = appId;
    this.option.set(otherOptions);
    this.env.set({
      app_id: appId,
    });

    Promise.all([
      new Promise<boolean>((resolve) => {
        this.once(Types.TokenComplete, () => {
          resolve(true);
        });
      }),
      new Promise<boolean>((resolve) => {
        if (this.checkUsePlugin('official:auto')) {
          this.on(Types.LaunchComplete, () => {
            resolve(true);
          });
        } else {
          resolve(true);
        }
      }),
      new Promise<boolean>((resolve) => {
        if (this.sended) {
          resolve(true);
        } else {
          this.once(Types.Send, () => {
            resolve(true);
          });
        }
      }),
    ]).then(() => {
      this.ready = true;
      this.emit(Types.Ready);
    });

    const cloneOptions = this.option.get() as TOption;
    this.pluginInstances.forEach((instance) => {
      instance.apply(this, cloneOptions);
    });

    if (this.get('is-crawler')) {
      return;
    }

    this.inited = true;
    this.emit(Types.Init);

    this.sessionId = uuid();
    this.on(Types.AppShowStart, () => {
      this.sessionId = uuid();
    });
  }

  config(configs: ConfigParams) {
    if (!this.inited || !isObject(configs)) {
      return;
    }
    this.emit(Types.Config, configs);
    this.emit(Types.ConfigTransform, configs);
    const {
      web_id: webId,
      user_unique_id: userUniqueId,
      ...otherConfigs
    } = configs;
    if (webId !== undefined) {
      this.emit(Types.ConfigWebId, webId);
    }
    if (userUniqueId !== undefined) {
      this.emit(Types.ConfigUuid, userUniqueId);
    }

    isObject(otherConfigs) &&
      Object.keys(otherConfigs).forEach((header) => {
        if (header === 'evtParams') {
          const { evtParams } = otherConfigs;
          isObject(evtParams) &&
            Object.keys(evtParams).forEach((evtParam) => {
              this._checkSet('header', evtParam, evtParams[evtParam]);
            });
        } else {
          this._checkSet('header', header, otherConfigs[header]);
        }
      });

    this.env.set(otherConfigs);
  }

  send() {
    if (!this.inited || this.sended) {
      return;
    }
    this.sended = true;
    this.emit(Types.Send);
  }

  event(event: string, params?: EventParams);
  event(
    events:
      | Array<[string, EventParams] | [string, EventParams, number]>
      | Array<TEventOuter>,
  );
  event(
    event:
      | string
      | Array<[string, EventParams] | [string, EventParams, number]>
      | Array<TEventOuter>,
    params?: EventParams,
  ) {
    if (this.get('is-crawler')) {
      return;
    }
    if (Array.isArray(event)) {
      const currentTime = now();
      const events = [];
      event.forEach((each) => {
        let event, params, time;
        if (Array.isArray(each)) {
          [event, params, time] = each;
        } else if (isObject(each)) {
          event = each.event;
          params = each.params;
          time = each.local_time_ms;
        }
        if (!event) {
          return;
        }
        if (!isNumber(time) || time < 0 || time > currentTime) {
          time = currentTime;
        }
        events.push(
          this.createEvent({
            event,
            params,
            time,
          }),
        );
      });
      if (events.length > 0) {
        this.emit(Types.Event, events);
      }
    } else {
      this.emit(
        Types.Event,
        this.createEvent({
          event,
          params,
        }),
      );
    }
  }

  createEvent(
    info: {
      event: string;
      params?: EventParams;
      time?: number;
    },
    ab: boolean = true,
  ): TEvent {
    const event = {
      event: info.event,
      params: info.params || {},
      local_time_ms: info.time || now(),
      ...(this.sessionId ? { session_id: this.sessionId } : {}),
    };

    const isProfile = event.event?.indexOf('__profile_') === 0;
    if (!isProfile) {
      this._checkSet('name', event.event);
    }
    isObject(event.params) &&
      Object.keys(event.params).forEach((param) => {
        this._checkSet(
          isProfile ? 'profile' : 'param',
          param,
          event.params[param],
        );
      });

    if (!ab) {
      return event;
    }
    let versions = '';
    const abVersions = this.get('ab_sdk_version');
    if (abVersions) {
      versions += abVersions;
    }
    const externalAbVersions = this.get('ab_sdk_version_external');
    if (externalAbVersions) {
      if (versions) {
        versions += ',' + externalAbVersions;
      } else {
        versions = externalAbVersions;
      }
    }
    return {
      ...event,
      ...(versions ? { ab_sdk_version: versions } : {}),
    };
  }

  set(key: string, value: any) {
    this.data.set(key, value);
  }

  get(key: string): any {
    return this.data.get(key);
  }

  getKey(which: string): undefined | string {
    const appId = this.appId;
    if (which === 'ab_version' || which === 'ab_version_external') {
      return `__tea_sdk_${which}_${appId}`;
    }
    const map = {
      token: 'tokens',
      report: 'reports',
      event: 'events',
      utm: 'utm',
      first: 'first',
      compensate: 'compensate',
    };
    return map[which] ? `__tea_cache_${map[which]}_${appId}` : undefined;
  }

  getUrl(path: string): string {
    const { option, env } = this;
    const version = env.get('_sdk_version');
    const name = (env.get('_sdk_name') || '').replace(/@.+\//, '');
    const url = `${option.get(
      'domain',
    )}${path}?sdk_version=${version}&sdk_name=${name}`;
    const caller = option.get('caller');
    if (caller) {
      return `${url}&app_id=${this.appId}&caller=${caller}`;
    }
    return url;
  }

  getToken(callback: (value: Record<string, any>) => void): void;
  getToken(): Promise<Record<string, any>>;
  getToken(
    callback?: (value: Record<string, any>) => void,
  ): void | Promise<Record<string, any>> {
    if (callback) {
      this.emit(Types.TokenGet, {
        callback,
      });
      return;
    }
    return new Promise((resolve) => {
      this.emit(Types.TokenGet, {
        callback: (value: any) => {
          resolve(value);
        },
      });
    });
  }

  getConfig(key?: string) {
    return this.env.get(key || 'header');
  }

  stash(event: string, params: EventParams = {}) {
    const key = `stash`;
    this.set(key, [
      ...(this.get(key) || []),
      this.createEvent({
        event,
        params,
      }),
    ]);
  }

  commit() {
    const key = `stash`;
    const stashs = this.get(key) || [];
    if (stashs.length > 0) {
      this.event(stashs);
      this.set(key, []);
    }
  }

  _checkSet(type: string, key: any, val?: any) {
    const keyCheck = (val: string): boolean => {
      return /^[a-zA-Z0-9][a-z0-9A-Z_ .-]{0,255}$/.test(val);
    };
    const valCheck = (val: any): boolean => {
      return String(val).length <= 1024;
    };
    switch (type) {
      case 'name':
        if (!keyCheck(String(key))) {
          Sdk._log?.warn?.(`event name ${key} illegal`);
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
          Sdk._log?.warn?.(`${text} name ${key} illegal`);
        }
        if (typeof val === 'string' && !valCheck(val)) {
          Sdk._log?.warn?.(
            `the value ${val} length more than 1024 in ${text} ${key}`,
          );
        }
        break;
      }
    }
  }

  /** AB相关api */
  getVar(name: string, defaultValue: any, callback: (value: any) => void): void;
  getVar(name: string, defaultValue: any): Promise<any>;
  getVar(
    name: string,
    defaultValue: any,
    callback?: (value: any) => void,
  ): void | Promise<any> {
    if (callback) {
      this.emit(Types.AbVar, {
        name,
        defaultValue,
        callback,
      });
      return;
    }
    return new Promise((resolve) => {
      this.emit(Types.AbVar, {
        name,
        defaultValue,
        callback: (value: any) => {
          resolve(value);
        },
      });
    });
  }
  getAllVars(callback: (value: any) => void): void;
  getAllVars(): Promise<any>;
  getAllVars(callback?: (value: any) => void): void | Promise<any> {
    if (callback) {
      this.emit(Types.AbAllVars, callback);
      return;
    }
    return new Promise((resolve) => {
      this.emit(Types.AbAllVars, (value: any) => {
        resolve(value);
      });
    });
  }
  getAbSdkVersion(): string {
    const abVersions = this.get('ab_versions') || [];
    return abVersions.length > 0 ? abVersions[abVersions.length - 1].ab : '';
  }
  onAbSdkVersionChange(cb: (versions: string) => void): () => void {
    this.emit(Types.AbVersionChangeOn, cb);
    return () => {
      this.emit(Types.AbVersionChangeOff, cb);
    };
  }
  offAbSdkVersionChange(cb: (versions: string) => void) {
    this.emit(Types.AbVersionChangeOff, cb);
  }
  setExternalAbVersion(vids: string | null) {
    this.emit(
      Types.AbExternalVersion,
      typeof vids === 'string' && vids ? `${vids}`.trim() : null,
    );
  }
  getAbConfig(
    params: Record<string, any>,
    callback: (value: any) => void,
  ): void;
  getAbConfig(params: Record<string, any>): Promise<any>;
  getAbConfig(
    params: Record<string, any>,
    callback?: (value: any) => void,
  ): void | Promise<any> {
    if (callback) {
      this.emit(Types.AbRefresh, {
        params,
        callback,
      });
      return;
    }
    return new Promise((resolve) => {
      this.emit(Types.AbRefresh, {
        params,
        callback: (value: any) => {
          resolve(value);
        },
      });
    });
  }

  /** profile相关api */
  profileSet(params: ProfileParams) {
    this.emit(Types.ProfileSet, params);
  }
  profileSetOnce(params: ProfileParams) {
    this.emit(Types.ProfileSetOnce, params);
  }
  profileUnset(key: string) {
    this.emit(Types.ProfileUnset, key);
  }
  profileIncrement(params: ProfileIncrementParams) {
    this.emit(Types.ProfileIncrement, params);
  }
  profileAppend(params: ProfileParams) {
    this.emit(Types.ProfileAppend, params);
  }

  /** APM */
  autoInitializationRangers(
    config: TOption & { app_id: number; onTokenReady: (webId: string) => void },
  ): void | Promise<string> {
    const { onTokenReady: callback, ...initOption } = config;
    this.init({
      ...initOption,
      log: false,
      enable_third: true,
    });
    this.send();
    return this.getToken().then((tokens) => {
      const { web_id: webId } = tokens;
      try {
        if (typeof callback === 'function') {
          callback(`${webId}`);
          return;
        }
      } catch (e) {}
      return `${webId}`;
    });
  }
}

export default Sdk;
