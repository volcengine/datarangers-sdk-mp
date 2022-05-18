export const undef = undefined;

export const REPORT_CHANNEL = 'cn';
export const AUTO_REPORT = false;
export const AUTO_PROFILE = false;
export const PROFILE_CHANNEL = 'cn';
export const ENABLE_AB_TEST = false;
export const CHANNEL_DOMAIN = '';
export const ENABLE_ET_TEST = false;
export const ENABLE_FILTER_LIST = false;
export const WHITE_API = ``;
export const CUSTOM_REPORT_URL = '';
export const ENABLE_PROFILE = false;
export const AB_CHANNEL_DOMAIN = '';
export const ENABLE_FILTER_CRAWLER = false;
export const EVENT_VERIFY_URL = '';
export const ENABLE_CUSTOM_WEBID = false;
export const ENABLE_THIRD = false;
export const REQUEST_TIMEOUT = 0;
export const CLEAR_AB_CACHE_ON_USER_CHANGE = true;
export const ENABLE_INITIATIVE_LAUNCH = false;

export const ENABLE_BUFFER = false;
export const BUFFER_INTERVAL = 5000;
export const BUFFER_NUMBER = 5;
export const ENABLE_STORAGE_ONLY = false;

export const DISABLE_SDK_MONITOR = false;

export const Domains = {
  // cn: 'https://mcs.ctobsnssdk.com',
  cn: 'https://mcs.volceapplog.com',
  va: 'https://mcs.itobsnssdk.com',
  sg: 'https://mcs.tobsnssdk.com',
};

export const EventType = {
  appOnShow: 'app_launch',
  appOnHide: 'app_terminate',
  appOnError: 'on_error',
  pageOnShow: 'predefine_pageview',
  pageOnHide: 'predefine_pageview_hide',
  pageOnShareAppMessage: 'on_share',
  pageOnAddToFavorites: 'on_addtofavorites',
};

export const UtmType = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
];

export const ProfileType = [
  '__profile_set',
  '__profile_set_once',
  '__profile_increment',
  '__profile_unset',
  '__profile_append',
];
