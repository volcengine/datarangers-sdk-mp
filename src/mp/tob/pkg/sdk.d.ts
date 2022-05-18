export interface AdapterLog {
  log: (...args: any[]) => void;
}

export interface AdapterRequest {
  (sdk: Sdk): (args: {
    url: string;
    data: object | any[];
    method?: 'POST' | 'GET';
    header?: object;
    dataType?: string;
    timeout?: number;
  }) => Promise<any>;
}

export interface AdapterStorage {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<boolean>;
  remove(key: string): Promise<boolean>;
}

export type SdkOption = Omit<InitParams, 'app_id'>;

declare enum SdkHook {
  Init = '$init',
  Config = '$config',
  Send = '$send',
  Ready = '$ready',
  TokenComplete = '$token-complete',
  UuidChangeBefore = '$uuid-change-before',
  UuidChangeAfter = '$uuid-change-after',
  Event = '$event',
  Report = '$report',
  AppOpen = '$app-open',
  AppClose = '$app-close',
  AppShow = '$app-show',
  AppHide = '$app-hide',
  AppError = '$app-error',
  AppShare = '$app-share',
  AppOnShare = '$app-on-share',
  PageShow = '$page-show',
  PageHide = '$page-hide',
  PageShare = '$page-share',
  SubmitBefore = '$submit-before',
  SubmitAfter = '$submit-after',
  SubmitError = '$submit-error',

  TransformInfo = '$transform-info',
  ExtendAppLaunch = '$extend-app-launch',
  ExtendAppTerminate = '$extend-app-terminate',
  ExtendAppError = '$extend-app-error',
  ExtendPageShow = '$extend-page-show',
  ExtendPageHide = '$extend-page-hide',
  ExtendPageShare = '$extend-page-share',
  ExtendPageFavorite = '$extend-page-favorite',
}

export type SdkHookListener = (hookInfo?: any) => void;

export interface Plugin {
  apply(sdk: Sdk, options: SdkOption): void;
}
export interface PluginConstructor {
  new (): Plugin;
  pluginName?: string;
  init?(Sdk: SdkConstructor): void;
}

type Channel = 'cn' | 'va' | 'sg';

type AutoConfig = {
  appLaunch: boolean;
  appTerminate: boolean;
  appError: boolean;
  pageShow: boolean;
  pageHide: boolean;
  pageShare: boolean;
  pageFavorite: boolean;
};
interface InitParams {
  app_id: number;
  caller?: string;

  log?: boolean;

  channel?: Channel;
  report_channel?: Channel;
  channel_domain?: string;
  report_url?: string;

  auto_report?: boolean | AutoConfig;

  enable_profile?: boolean;

  enable_ab_test?: boolean;
  ab_channel_domain?: string;
  clear_ab_cache_on_user_change?: boolean;

  enable_filter_list?: boolean;
  enable_third?: boolean;
  enable_filter_crawler?: boolean;

  request_timeout?: number;
  enable_initiative_launch?: boolean;
  enable_custom_webid?: boolean;

  enable_buffer?: boolean;
  buffer_interval?: number;
  buffer_number?: number;
  enable_storage?: boolean;
  disable_storage?: boolean;
  report_interval?: number;
  max_batch_event?: number;
  max_storage_num?: number;
  enable_storage_only?: boolean;

  disable_sdk_monitor?: boolean;
}

interface ConfigParams {
  _staging_flag?: number | boolean;
  evtParams?: EventParams;
  [key: string]: any;
}

type EventParams = Record<string, any>;

type ProfileParams = Record<string, string | number | Array<string>>;
type ProfileIncrementParams = Record<string, number>;

interface SdkConstructor {
  new (): Sdk;
  instances: Array<Sdk>;
  useAdapterLog: (adapter: AdapterLog) => void;
  useAdapterRequest: (adapter: AdapterRequest) => void;
  useAdapterStorage: (adapter: AdapterStorage) => void;
  usePlugin: (plugin: PluginConstructor, pluginName?: string) => void;
}

interface Sdk {
  env: Env;
  types: typeof SdkHook;
  SdkHook: typeof SdkHook;

  on(type: string, hook: SdkHookListener): void;
  once(type: string, hook: SdkHookListener): void;
  off(type: string, hook?: SdkHookListener): void;
  emit(type: string, info?: any): void;

  init(options: InitParams): void;
  config(configs?: ConfigParams): void;
  send(): void;
  event(event: string, params?: EventParams): void;
  event(
    events:
      | Array<[string, EventParams] | [string, EventParams, number]>
      | Array<{
          event: string;
          params?: EventParams;
          local_time_ms?: number;
        }>,
  ): void;

  set(key: string, value: any): void;
  get(key: string): any;
  getKey(which: string): undefined | string;
  getToken(callback: (info: Record<string, string | number>) => void): void;
  getToken(): Promise<Record<string, string | number>>;
  getConfig(key?: string): Record<string, any>;
  stash(event: string, params?: EventParams): void;
  commit(): void;

  getVar(name: string, defaultValue: any, callback: (value: any) => void): void;
  getVar(name: string, defaultValue: any): Promise<any>;
  getAllVars(callback: (value: any) => void): void;
  getAllVars(): Promise<any>;
  getAbSdkVersion(): string;
  onAbSdkVersionChange(callback: (vids: string) => void): () => void;
  offAbSdkVersionChange(callback: (vids: string) => void): void;
  setExternalAbVersion(vids: string | null): void;
  getAbConfig(
    params: Record<string, any>,
    callback: (value: any) => void,
  ): void;
  getAbConfig(params: Record<string, any>): Promise<any>;

  profileSet(params: ProfileParams): void;
  profileSetOnce(params: ProfileParams): void;
  profileUnset(key: string): void;
  profileIncrement(params: ProfileIncrementParams): void;
  profileAppend(params: ProfileParams): void;

  autoInitializationRangers(
    config: InitParams & { onTokenReady: (webId: string) => void },
  ): void;
  autoInitializationRangers(config: InitParams): Promise<string>;

  appLaunch(): void;
  appTerminate(): void;
  appShow(): void;
  appHide(): void;
  appError(error: string): void;
  predefinePageview(): void;
  predefinePageviewHide(): void;
  shareAppMessage(info: any): any;

  setWebIDviaUnionID(unionId: string): void;
  setWebIDviaOpenID(openId: string): void;
  createWebViewUrl(url: string): string;
  createWebViewUrlAsync(url: string): Promise<string>;
}

interface Env {
  set(info: any): void;
  get(key?: string): any;
}

declare const Sdk: SdkConstructor;
export default Sdk;
