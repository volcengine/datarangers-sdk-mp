import {
  REPORT_CHANNEL,
  AUTO_REPORT,
  AUTO_PROFILE,
  PROFILE_CHANNEL,
  ENABLE_AB_TEST,
  CHANNEL_DOMAIN,
  ENABLE_ET_TEST,
  ENABLE_FILTER_LIST,
  CUSTOM_REPORT_URL,
  ENABLE_PROFILE,
  AB_CHANNEL_DOMAIN,
  ENABLE_FILTER_CRAWLER,
  EVENT_VERIFY_URL,
  ENABLE_CUSTOM_WEBID,
  ENABLE_THIRD,
  REQUEST_TIMEOUT,
  CLEAR_AB_CACHE_ON_USER_CHANGE,
  ENABLE_INITIATIVE_LAUNCH,
  ENABLE_BUFFER,
  BUFFER_INTERVAL,
  BUFFER_NUMBER,
  ENABLE_STORAGE_ONLY,
  Domains,
  DISABLE_SDK_MONITOR,
} from './constant';
import { isObject } from '../tool/is';

export type AutoConfig = {
  appLaunch: boolean;
  appTerminate: boolean;
  appError: boolean;
  pageShow: boolean;
  pageHide: boolean;
  pageShare: boolean;
  pageFavorite: boolean;
};

export type TOption = {
  caller: string;
  log: boolean;

  channel: string;
  report_channel: string;
  channel_domain: string;
  report_url: string;

  auto_report: boolean | AutoConfig;

  auto_profile: boolean;
  profile_channel: string;
  enable_profile: boolean;

  enable_ab_test: boolean;
  ab_channel_domain: string;
  clear_ab_cache_on_user_change?: boolean;

  enable_et_test: boolean;
  event_verify_url: string;

  enable_filter_list: boolean;
  enable_third: boolean;
  enable_filter_crawler: boolean;

  request_timeout?: number;
  enable_initiative_launch?: boolean;
  enable_custom_webid: boolean;

  enable_buffer: boolean;
  buffer_interval: number;
  buffer_number: number;
  enable_storage?: boolean;
  disable_storage?: boolean;
  report_interval?: number;
  max_batch_event?: number;
  max_storage_num?: number;
  enable_storage_only?: boolean;

  disable_sdk_monitor?: boolean;
};

class Option {
  private option: TOption;
  private cloneOption: TOption;
  private domains = Domains;
  private domain: string;

  constructor() {
    this.init();
  }

  private init() {
    this.option = {
      caller: '',
      log: false,

      // channel相关
      channel: REPORT_CHANNEL,
      report_channel: REPORT_CHANNEL,
      channel_domain: CHANNEL_DOMAIN,
      report_url: CUSTOM_REPORT_URL,

      // 自动上报
      auto_report: AUTO_REPORT,

      // profile老的
      auto_profile: AUTO_PROFILE,
      profile_channel: PROFILE_CHANNEL,
      // profile新的
      enable_profile: ENABLE_PROFILE,

      // ab
      enable_ab_test: ENABLE_AB_TEST,
      ab_channel_domain: AB_CHANNEL_DOMAIN,
      clear_ab_cache_on_user_change: CLEAR_AB_CACHE_ON_USER_CHANGE,

      // et
      enable_et_test: ENABLE_ET_TEST,
      event_verify_url: EVENT_VERIFY_URL,

      // 缓冲
      enable_buffer: ENABLE_BUFFER,
      buffer_interval: BUFFER_INTERVAL,
      buffer_number: BUFFER_NUMBER,
      enable_storage_only: ENABLE_STORAGE_ONLY,

      // filter - 未启
      enable_filter_list: ENABLE_FILTER_LIST,
      enable_third: ENABLE_THIRD,
      // filter - 在用
      enable_filter_crawler: ENABLE_FILTER_CRAWLER,

      // 其他
      request_timeout: REQUEST_TIMEOUT,
      enable_initiative_launch: ENABLE_INITIATIVE_LAUNCH,

      // 自定义web_id
      enable_custom_webid: ENABLE_CUSTOM_WEBID,

      // monitor
      disable_sdk_monitor: DISABLE_SDK_MONITOR,
    };
    this.cloneOption = {
      ...this.option,
    };
    this.initDomain();
  }

  private initDomain() {
    if (this.option['channel_domain']) {
      this.domain = this.option['channel_domain'];
      return;
    }
    let reportChannel = this.option['report_channel'];
    const keys = Object.keys(this.domains);
    if (!keys.includes(reportChannel)) {
      reportChannel = REPORT_CHANNEL;
    }
    this.domain = this.domains[reportChannel];
  }

  set(option: Partial<TOption>) {
    if (!isObject(option)) {
      return;
    }
    Object.keys(option).forEach((key) => {
      if (this.option.hasOwnProperty(key)) {
        if (key === 'channel' || key === 'report_channel') {
          this.option['report_channel'] = this.option['channel'] = option[key]
            ? option[key]
            : this.cloneOption[key];
          this.initDomain();
        } else {
          this.option[key] =
            option[key] === undefined ? this.cloneOption[key] : option[key];
          if (key === 'channel_domain') {
            this.initDomain();
          }
        }
      }
    });
  }

  get(key?: string): undefined | TOption[keyof TOption] | TOption {
    if (key) {
      if (this.hasOwnProperty(key)) {
        return this[key];
      }
      if (this.option.hasOwnProperty(key)) {
        return this.option[key];
      }
      return;
    }
    return {
      ...this.option,
    };
  }
}

export default Option;
