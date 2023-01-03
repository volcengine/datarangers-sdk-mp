// Copyright 2022 Beijing Volcanoengine Technology Ltd. All Rights Reserved.
import Env from './env';
import Option from './option';
import Hook from './hook';
import Adapter from './adapter';
import Types from './type';
import { EventType, ProfileType, UtmType, Domains } from './constant';
import { isObject, isNumber, isArray, isString, isFunction } from '../tool/is';
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
  public types = Types;
  public EventType = EventType;
  public ProfileType = ProfileType;
  public UtmType = UtmType;
  public SdkHook = Types;
  public Domains = Domains;

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

  public inited: boolean = false;
  public sended: boolean = false;
  private _appId: number;

  protected pluginInstances: Array<Plugin> = [];
  // protected pluginInstances: Array<{ instance: Plugin; name: string }> = [];
  private data: Record<string, any> = {};
  private unInitedCache: any[] = [];

  public target: any;
  public targetEnvConfig: any;
  public whichIs: string;

  public ready: boolean = false;
  public sessionId: string = '';
  private appShowStarted: boolean = false;

  constructor() {
    this.env = new Env(this);
    this.option = new Option();
    this.hook = new Hook();
    this.sessionId = uuid();
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

      // Sdk.plugins.reduce((result, plugin) => {
      //   const { plugin: P, name } = plugin;
      //   result.push({
      //     name,
      //     instance: new P(),
      //   });
      //   return result;
      // }, this.pluginInstances);
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
    if (this.inited || !this.isObject(options)) {
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
        this.once(this.types.TokenComplete, () => {
          resolve(true);
        });
      }),
      new Promise<boolean>((resolve) => {
        if (options['enable_skip_launch']) {
          resolve(true);
          return;
        }
        if (this.checkUsePlugin('official:auto')) {
          this.on(this.types.LaunchComplete, () => {
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
          this.once(this.types.Send, () => {
            resolve(true);
          });
        }
      }),
    ]).then(() => {
      this.ready = true;
      this.emit(this.types.Ready);
    });

    this.on(this.types.AppShowStart, () => {
      if (!this.appShowStarted) {
        this.appShowStarted = true;
      } else {
        this.sessionId = uuid();
      }
    });
    this.on(this.types.UuidChangeAfter, () => {
      this.sessionId = uuid();
    });

    const cloneOptions = this.option.get() as TOption;
    this.pluginInstances.forEach((instance) => {
      instance.apply(this, cloneOptions);
    });

    // this.pluginInstances.filter(({ instance, name }) => {
    //   if (
    //     [
    //       'official:token',
    //       'official:info',
    //       'official:report',
    //       'official:buffer',
    //       'official:transform',
    //     ].includes(name)
    //   ) {
    //     instance.apply(this, cloneOptions);
    //   } else {
    //     Promise.resolve().then(() => {
    //       instance.apply(this, cloneOptions);
    //     });
    //   }
    // });

    if (this.get('is-crawler')) {
      return;
    }

    this.inited = true;
    this.emit(this.types.Init);

    if (this.unInitedCache.length > 0) {
      this.unInitedCache.forEach((eventData) => {
        this.emit(this.types.Event, eventData);
      });
    }
  }

  config(configs: ConfigParams) {
    if (!this.inited || !this.isObject(configs)) {
      return;
    }
    this.emit(this.types.Config, configs);
    this.emit(this.types.ConfigTransform, configs);
    const {
      web_id: webId,
      user_unique_id: userUniqueId,
      ...otherConfigs
    } = configs;
    if (webId !== undefined) {
      this.emit(this.types.ConfigWebId, webId);
    }
    if (userUniqueId !== undefined) {
      this.emit(this.types.ConfigUuid, userUniqueId);
    }

    if (!this.option.get('disable_check')) {
      this.emit(this.types.Check, {
        type: 'config',
        value: otherConfigs,
      });
    }

    this.env.set(otherConfigs);
  }

  send() {
    if (!this.inited || this.sended) {
      return;
    }
    this.sended = true;
    this.emit(this.types.Send);
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
        } else if (this.isObject(each)) {
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
        if (!this.inited) {
          this.unInitedCache.push(events);
        } else {
          this.emit(this.types.Event, events);
        }
      }
    } else {
      const eventData = this.createEvent({
        event,
        params,
      });
      if (!this.inited) {
        this.unInitedCache.push(eventData);
      } else {
        this.emit(this.types.Event, eventData);
      }
      // this.emit(this.types.Verify, {
      //   event,
      //   params,
      // });
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

    if (!this.option.get('disable_check')) {
      this.emit(this.types.Check, {
        type: 'event',
        value: event,
      });
    }

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
    this.data[key] = value;
  }

  get(key: string): any {
    return this.data[key];
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
      buffer: 'buffer',
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
      this.emit(this.types.TokenGet, {
        callback,
      });
      return;
    }
    return new Promise((resolve) => {
      this.emit(this.types.TokenGet, {
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

  isObject(obj: any): boolean {
    return isObject(obj);
  }

  isArray(obj: any): boolean {
    return isArray(obj);
  }

  isNumber(obj: any): boolean {
    return isNumber(obj);
  }

  isString(obj: any): boolean {
    return isString(obj);
  }

  isFunction(obj: any): boolean {
    return isFunction(obj);
  }

  isUndefined(obj: any): boolean {
    return typeof obj === 'undefined';
  }

  setUserUniqueID(uuid: string | number | null) {
    this.config({
      user_unique_id: uuid,
    });
  }

  setHeaderInfo(key: string, value: any) {
    this.config({
      [key]: value,
    });
  }

  removeHeaderInfo(key: string) {
    this.config({
      [key]: undefined,
    });
  }
}

export default Sdk;
