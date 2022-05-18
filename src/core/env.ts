import { undef } from './constant';
import { isObject } from '../tool/is';
import { now } from '../tool/time';
import type Sdk from './sdk';
import type { TEventData } from './sdk';

export type TEnv = {
  user: Record<string, any>;
  header: {
    app_id: number;
    custom: Record<string, any>;
    [key: string]: any;
  };
};

class Env {
  private sdk: Sdk;
  private env: TEnv;
  evtParams: Record<string, any>;

  constructor(sdk: Sdk) {
    this.sdk = sdk;
    this.env = this.init();
  }

  private init() {
    return {
      user: {
        web_id: undef,
        user_unique_id: undef,
        user_id: undef,
        user_type: undef,
        user_is_auth: undef,
        user_is_login: undef,
        ip_addr_id: undef,
        device_id: undef,
      },
      header: {
        app_id: undef,
        app_name: undef, // app名称
        app_install_id: undef, // - install_id
        install_id: undef, // - 同上
        app_package: undef, // app包名
        app_channel: undef, // app分发渠道
        app_version: undef, // app版本
        os_name: undef, // 客户端系统
        os_version: undef, // 客户端系统版本号
        device_model: undef, // 设备型号
        device_brand: undef, // 设备品牌
        traffic_type: undef, // +
        client_ip: undef, // 客户端ip
        os_api: undef, // 客户端系统api版本号
        access: undef, // 网络访问类型
        language: undef, // 系统语言
        app_language: undef, // app语言
        creative_id: undef, // +
        ad_id: undef, // +
        campaign_id: undef, // +

        ab_client: undef, // 实验客户端标识
        ab_version: undef, // 实验分组信息

        platform: undef, // 平台类型
        sdk_version: undef, // sdk版本
        sdk_lib: undef, // sdk包

        app_region: undef, // app设置的地区
        region: undef, // 系统设置的地区
        province: undef, // 省
        city: undef, // 城市
        timezone: undef, // 时区
        tz_offset: undef, // 时区偏移
        tz_name: undef, // 时区名

        sim_region: undef, // sim卡地区
        carrier: undef, // 运营商

        resolution: undef, // 分辨率 screen_width x screen_height
        // width: undef, // 屏幕宽
        // height: undef, // 屏幕高
        screen_width: undef, // - 同width
        screen_height: undef, // - 同height

        browser: undef, // 浏览器名
        browser_version: undef, // 浏览器版本
        referrer: undef, // 前向地址
        referrer_host: undef, // 前向域名

        utm_source: undef,
        utm_medium: undef,
        utm_campaign: undef,
        utm_term: undef,
        utm_content: undef,

        custom: {},

        ab_sdk_version: undef,

        // SDK自身扩展
        _sdk_version: undef,
        _sdk_name: undef,

        // 支持自定义webid
        wechat_openid: undef,
        wechat_unionid: undef,
      },
    };
  }

  set(info: any) {
    this.sdk.emit(this.sdk.types.EnvTransform, info);
    Object.keys(info).forEach((key) => {
      if (key === 'evtParams') {
        this.evtParams = {
          ...(this.evtParams || {}),
          ...(info.evtParams || {}),
        };
      } else if (key === '_staging_flag') {
        this.evtParams = {
          ...(this.evtParams || {}),
          _staging_flag: info._staging_flag,
        };
      } else {
        let localKey = key;
        let localValue = info[key];
        if (localValue === null) {
          return false;
        }
        let scope = '';
        if (localKey.indexOf('.') > -1) {
          [scope, localKey] = localKey.split('.');
        }
        if (localKey === 'platform') {
          localValue = `mp`;
        }
        if (localKey === 'os_version' || localKey === 'mp_platform') {
          localValue = `${localValue}`;
        }
        if (scope) {
          scope === 'headers' && (scope = 'header');
          if (scope === 'user' || scope === 'header') {
            this.env[scope][localKey] = localValue;
          } else {
            this.env.header.custom[localKey] = localValue;
          }
        } else if (this.env.user.hasOwnProperty(localKey)) {
          if (['user_type', 'ip_addr_id'].indexOf(localKey) > -1) {
            this.env.user[localKey] = Number(localValue);
          } else if (
            ['user_id', 'web_id', 'user_unique_id'].indexOf(localKey) > -1
          ) {
            this.env.user[localKey] = String(localValue);
          } else if (['user_is_auth', 'user_is_login'].indexOf(localKey) > -1) {
            this.env.user[localKey] = Boolean(localValue);
          } else if (['device_id'].indexOf(localKey) > -1) {
            this.env.user[localKey] = localValue;
          }
        } else if (this.env.header.hasOwnProperty(localKey)) {
          this.env.header[localKey] = localValue;
        } else {
          this.env.header.custom[localKey] = localValue;
        }
      }
    });
  }

  get(key?: string): any {
    if (!key || key === 'env') {
      return this.clone(this.env);
    }
    if (key === 'evtParams') {
      return {
        ...this[key],
      };
    }
    if (this.env.hasOwnProperty(key)) {
      return this.clone(this.env[key]);
    }
    if (this.env.user.hasOwnProperty(key)) {
      return this.clone(this.env.user[key]);
    }
    if (this.env.header.hasOwnProperty(key)) {
      return this.clone(this.env.header[key]);
    }
    if (this.env.header.custom.hasOwnProperty(key)) {
      return this.clone(this.env.header.custom[key]);
    }
  }

  compose(events: any[], filterEvents: string[] = []): TEventData {
    const { user, header } = this.env;
    const { evtParams } = this;
    const cloneEvents = events.map((event) => {
      if (event.event && !filterEvents.includes(event.event)) {
        evtParams &&
          Object.keys(evtParams).forEach((key) => {
            if (event.params[key] === undefined) {
              event.params[key] = evtParams[key];
            }
          });
      }
      event.params = JSON.stringify(event.params);
      return event;
    });
    return this.clone({
      events: cloneEvents,
      user,
      header,
    });
  }

  merge(events: any[], filterEvents: string[] = []): TEventData[] {
    const compose = this.compose(events, filterEvents);
    compose.local_time = Math.floor(now() / 1000);
    return [compose];
  }

  private clone(obj: object) {
    if (isObject(obj)) {
      return JSON.parse(JSON.stringify(obj));
    }
    return obj;
  }
}

export default Env;
