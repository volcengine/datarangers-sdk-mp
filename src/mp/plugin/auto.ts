// Copyright 2022 Beijing Volcanoengine Technology Ltd. All Rights Reserved.
import { now } from '../../tool/time';
import { isObject } from '../../tool/is';
import { safeDecodeURIComponent, unserializeUrl } from '../../tool/safe';
import type Sdk from '../../core/sdk';
import type { TEvent } from '../../core/sdk';
import type { TOption, AutoConfig } from '../../core/option';

declare var App;
declare var Page;
declare var Component;
declare const getCurrentPages;

enum FirstTime {
  True = 'true',
  False = 'false',
}

abstract class Auto {
  static pluginName: string = 'official:auto';
  sdk: Sdk;
  options: TOption;
  queue: TEvent[] = [];
  firstTime: FirstTime = FirstTime.False;
  open: boolean = false;
  launched: boolean = false;
  appInfo: any;
  scene: number;

  autoConfig: AutoConfig = {
    appLaunch: true,
    appTerminate: true,
    appError: true,
    pageShow: true,
    pageHide: true,
    pageShare: true,
    pageFavorite: true,
  };

  static instances: Auto[] = [];

  missAppLaunch: boolean = false;
  missAppLaunchInfo: any;

  missAppShow: boolean = false;
  missAppShowInfo: any;

  static init(Sdk) {
    const appHooks = {
      onLaunch(info: any) {
        Sdk.instances.forEach((sdk) => {
          sdk.emit(sdk.types.AppOpen, info);
        });

        Auto.instances.forEach((auto) => {
          if (!auto.sdk) {
            auto.missAppLaunch = true;
            auto.missAppLaunchInfo = info;
          }
        });
      },
      onShow(info: any) {
        Sdk.instances.forEach((sdk) => {
          sdk.emit(sdk.types.AppShowStart, info);
          sdk.emit(sdk.types.AppShow, info);
        });

        Auto.instances.forEach((auto) => {
          if (!auto.sdk) {
            auto.missAppShow = true;
            auto.missAppShowInfo = info;
          }
        });
      },
      onHide() {
        Sdk.instances.forEach((sdk) => {
          sdk.emit(sdk.types.AppHide);
          sdk.emit(sdk.types.AppClose);
        });
      },
      onError(error: string) {
        Sdk.instances.forEach((sdk) => {
          sdk.emit(sdk.types.AppError, error);
        });
      },
    };

    const someHooks = {
      onShow() {
        Sdk.instances.forEach((sdk) => {
          sdk.emit(sdk.types.PageShow);
        });
      },
      onHide() {
        Sdk.instances.forEach((sdk) => {
          sdk.emit(sdk.types.PageHide);
        });
      },
      onUnload() {
        Sdk.instances.forEach((sdk) => {
          sdk.emit(sdk.types.PageHide);
        });
      },
      onShareAppMessage(info: any) {
        const length = Auto.instances.length;
        if (!length) {
          return info;
        }
        const autoInstance = Auto.instances[length - 1];
        if (
          !autoInstance.sdk ||
          !autoInstance.open ||
          !autoInstance.autoConfig.pageShare
        ) {
          return info;
        }
        return autoInstance.pageShare(info);
      },
      onAddToFavorites(info: any) {
        const length = Auto.instances.length;
        if (!length) {
          return;
        }
        Auto.instances.forEach((autoInstance) => {
          if (
            !autoInstance.sdk ||
            !autoInstance.open ||
            !autoInstance.autoConfig.pageFavorite
          ) {
            return;
          }
          autoInstance.pageFavorite(info);
        });
      },
    };

    if (Sdk.platform && Sdk.platformIs === 'swan') {
      if (App.after && Page.after) {
        App.after({
          methods: {
            ...appHooks,
          },
        });

        Page.after({
          methods: {
            ...someHooks,
          },
        });
        return;
      }
    }

    const originApp = App;
    App = function (hooks) {
      Object.keys(appHooks).forEach((hook) => {
        const userHook = hooks[hook];
        hooks[hook] = function (...args) {
          try {
            appHooks[hook].apply(this, args);
          } catch (e) {}
          return userHook && userHook.apply(this, args);
        };
      });
      return originApp(hooks);
    };

    const originPage = Page;
    Page = function (hooks) {
      const pageHooks = someHooks;
      Object.keys(pageHooks).forEach((hook) => {
        const userHook = hooks[hook];
        if (hook === 'onShareAppMessage') {
          if (userHook) {
            hooks[hook] = function (...args) {
              const result = userHook ? userHook.apply(this, args) : {};
              try {
                const hookResult = pageHooks[hook].apply(this, [result]);
                result.path = hookResult.path;
              } catch (e) {}
              return result;
            };
          }
        } else if (hook === 'onAddToFavorites') {
          if (userHook) {
            hooks[hook] = function (...args) {
              const result = userHook ? userHook.apply(this, args) : {};
              try {
                pageHooks[hook].apply(this, [
                  {
                    res: args[0],
                    result,
                  },
                ]);
              } catch (e) {}
              return result;
            };
          }
        } else {
          hooks[hook] = function (...args) {
            try {
              pageHooks[hook].apply(this, args);
            } catch (e) {}
            return userHook && userHook.apply(this, args);
          };
        }
      });
      return originPage(hooks);
    };

    if (typeof Component !== 'undefined') {
      const originComponent = Component;
      Component = function (hooks) {
        if (!hooks.methods) {
          hooks.methods = {};
        }
        const componentHooks = someHooks;
        Object.keys(componentHooks).forEach((hook) => {
          const userHook = hooks.methods[hook];
          if (hook === 'onShareAppMessage') {
            if (userHook) {
              hooks.methods[hook] = function (...args) {
                const result = userHook ? userHook.apply(this, args) : {};
                try {
                  const hookResult = componentHooks[hook].apply(this, [result]);
                  result.path = hookResult.path;
                } catch (e) {}
                return result;
              };
            }
          } else if (hook === 'onAddToFavorites') {
            if (userHook) {
              hooks.methods[hook] = function (...args) {
                const result = userHook ? userHook.apply(this, args) : {};
                try {
                  componentHooks[hook].apply(this, [
                    {
                      res: args[0],
                      result,
                    },
                  ]);
                } catch (e) {}
                return result;
              };
            }
          } else {
            hooks.methods[hook] = function (...args) {
              try {
                componentHooks[hook].apply(this, args);
              } catch (e) {}
              return userHook && userHook.apply(this, args);
            };
          }
        });
        return originComponent(hooks);
      };
    }
  }

  constructor() {
    Auto.instances.push(this);
  }

  apply(sdk: Sdk, options: TOption) {
    this.sdk = sdk;
    this.options = options;
    this.open = !!this.options['auto_report'];
    if (this.open && typeof this.options['auto_report'] === 'object') {
      this.autoConfig = {
        ...this.autoConfig,
        ...(this.options['auto_report'] || {}),
      };
    }

    this.proxySetTitle();

    const { types, adapter } = this.sdk;
    const firstKey = this.sdk.getKey('first');
    adapter.get(firstKey).then((cache) => {
      if (cache === FirstTime.False) {
        this.firstTime = FirstTime.False;
        return;
      }
      if (!cache) {
        this.firstTime = FirstTime.True;
      }
      adapter.set(firstKey, FirstTime.False);
    });

    this.sdk.on(types.Ready, () => {
      if (this.queue.length > 0) {
        this.sdk.event([...this.queue]);
        this.queue.length = 0;
      }
    });

    this.sdk.on(types.AppOpen, (info) => {
      this.appLaunch(info);
    });

    if (this.missAppLaunch) {
      this.appLaunch(this.missAppLaunchInfo);
    }

    this.sdk.on(types.AppShow, (info) => {
      this.appShowPrefix(info);
      this.open && this.autoConfig.appLaunch && this.appShow(info);
    });

    if (this.missAppShow) {
      this.appShowPrefix(this.missAppShowInfo);
      this.open &&
        this.autoConfig.appLaunch &&
        this.appShow(this.missAppShowInfo);
    }

    this.sdk.on(types.AppHide, () => {
      this.open && this.autoConfig.appTerminate && this.appHide();
    });

    this.sdk.on(types.AppError, (error) => {
      this.open && this.autoConfig.appError && this.appError(error);
    });

    this.sdk.on(types.PageShow, () => {
      const routeInfo = this.getRouteInfo();
      if (routeInfo) {
        const { path, query } = routeInfo;
        this.sdk.env.set({
          evtParams: {
            $current_path: path,
            ...(query ? { $current_query: JSON.stringify(query) } : {}),
          },
        });
      }
      this.open && this.autoConfig.pageShow && this.pageShow();
    });

    this.sdk.on(types.PageHide, () => {
      this.open && this.autoConfig.pageHide && this.pageHide();
    });

    // this.sdk.on(types.PageShare, (info) => {
    //   this.open && this.pageShare(info);
    // });

    this.sdk.on(types.UuidChangeBefore, () => {
      this.open && this.autoConfig.appTerminate && this.appHide();
    });
    this.sdk.on(types.UuidChangeAfter, () => {
      this.open && this.autoConfig.appLaunch && this.appShow(this.appInfo);
    });
  }

  event(event: string, params?: any) {
    const { ready } = this.sdk;
    if (ready) {
      this.sdk.event(event, params);
    } else {
      this.queue.push({
        event,
        params,
        local_time_ms: now(),
      });
    }
  }

  proxySetTitle() {
    const { target } = this.sdk;
    if (!target) {
      return;
    }
    const that = this;
    try {
      const proxySet = (old: any) => {
        return function () {
          return function (titleInfo) {
            try {
              const pages = getCurrentPages();
              const currentPagePath = pages[pages.length - 1].route || '';
              if (!isObject(titleInfo)) {
                titleInfo = {};
              }
              const caches = that.sdk.get('title-caches') || {};
              caches[currentPagePath] = titleInfo.title;
              that.sdk.set('title-caches', caches);
            } catch (e) {}
            old.call(this, titleInfo);
          };
        };
      };
      if (typeof target.setNavigationBarTitle !== 'undefined') {
        const old = target.setNavigationBarTitle;
        Object.defineProperty(target, 'setNavigationBarTitle', {
          get: proxySet(old),
        });
      } else if (typeof target.setNavigationBar !== 'undefined') {
        const old = target.setNavigationBar;
        Object.defineProperty(target, 'setNavigationBar', {
          get: proxySet(old),
        });
      }
    } catch (e) {}
  }

  getPageTitle(path: string): string {
    const { targetEnvConfig } = this.sdk;
    const caches = this.sdk.get('title-caches');
    let title = '';
    if (caches?.[path] !== undefined) {
      title = caches[path];
    }
    if (!title) {
      try {
        if (targetEnvConfig) {
          const pageInfo =
            targetEnvConfig.page[path] || targetEnvConfig.page[path + '.html'];
          if (pageInfo) {
            title = pageInfo.window.navigationBarTitleText;
          }
          if (!title) {
            title = targetEnvConfig.global.window.navigationBarTitleText;
          }
        }
      } catch (e) {}
    }
    return title;
  }

  getRouteInfo(
    lastIndex: number = 1,
    pages?: any[],
  ): Record<string, any> | null {
    try {
      pages = pages || getCurrentPages();
      const index = pages.length - lastIndex;
      if (index < 0) {
        return null;
      }
      const { route: path = '', options: query = {} } = pages[index];
      return {
        path,
        query,
      };
    } catch (e) {}
    return null;
  }

  getCurrentPage() {
    const pages = getCurrentPages() || [];
    return pages[pages.length - 1];
  }

  getQuery(query: Record<string, any> = {}): Record<string, any> {
    const qs = {};
    if (isObject(query)) {
      if (query.scene) {
        const sceneObj = unserializeUrl(
          safeDecodeURIComponent(`${query.scene}`),
        );
        Object.keys(sceneObj).forEach((key) => {
          qs[`query_${key}`] = sceneObj[key];
        });
      }
      Object.keys(query).forEach((key) => {
        if (!this.sdk.UtmType.includes(key) && key !== 'scene') {
          let value = query[key];
          if (key === 'from_title') {
            value = encodeURIComponent(safeDecodeURIComponent(query[key]));
          }
          qs[`query_${key}`] = value;
        }
      });
    }
    return qs;
  }

  fixInfo(type: string, rawInfo: any) {
    let info: any = rawInfo;
    if (!rawInfo.path) {
      if (rawInfo.args) {
        info = rawInfo.args;
      } else {
        try {
          JSON.stringify(rawInfo);
        } catch (e) {
          info = {
            query: {},
          };
        }
      }
    }
    const wrapInfo = {
      info,
    };
    this.sdk.emit(this.sdk.types.TransformInfo, {
      type,
      rawInfo,
      wrapInfo,
    });
    info = wrapInfo.info;
    return info;
  }

  appLaunch(info?: any) {
    this.appInfo = info || this.sdk.target.getLaunchOptionsSync?.();
    this.appInfo = this.fixInfo('App.onLaunch', this.appInfo);
    this.scene = this.appInfo?.scene;
    if (this.sdk.checkUsePlugin('official:utm')) {
      this.sdk.emit(this.sdk.types.LaunchInfo, this.appInfo);
    } else {
      this.sdk.emit(this.sdk.types.LaunchComplete);
    }
  }

  appShowPrefix(info?: any) {
    if (this.sdk.checkUsePlugin('official:utm')) {
      this.sdk.emit(this.sdk.types.LaunchInfo, info);
    }
  }

  abstract appShow(info?: any);
  abstract appHide();
  abstract appError(error: string);
  abstract pageShow();
  abstract pageHide();
  abstract pageShare(info: any);
  abstract pageFavorite(info: any);
}

class OldAuto extends Auto {
  sessionStart: number = 0;
  sessionDepth: number = 0;
  shareDepth: number = 0;
  recentlyPage: any;
  currentPvInfo: any;

  appShow(info?: any) {
    info = info || this.appInfo;
    info = this.fixInfo('App.onShow', info);
    const sessionId = this.sdk.sessionId;
    this.sessionStart = now();
    const { query: { share_depth: shareDepth = 0 } = {} } = info;
    this.shareDepth = Number(shareDepth) || 0;

    const { EventType } = this.sdk;
    const { referrerInfo, ...params } = info;
    const { query, ...other } = params;
    const newQuery = {
      ...query,
      ...referrerInfo,
    };

    const data = {
      session_id: sessionId,
      $is_first_time: this.firstTime,
      ...other,
      ...(this.scene ? { scene: this.scene } : {}),
      ...this.getQuery(newQuery),
    };

    this.sdk.emit(this.sdk.types.ExtendAppLaunch, data);

    this.event(EventType.appOnShow, data);

    if (this.firstTime === FirstTime.True) {
      this.firstTime = FirstTime.False;
    }
  }

  appHide() {
    const { route, __route__, options: query = {} } = this.getCurrentPage();
    const path = route || __route__;

    const data = {
      exit_page: path,
      session_duration: Math.ceil((now() - this.sessionStart) / 1000),
      session_depth: this.sessionDepth,
      session_id: this.sdk.sessionId,
      ...(this.scene ? { scene: this.scene } : {}),
      ...this.getQuery(query),
    };

    this.sdk.emit(this.sdk.types.ExtendAppTerminate, data);

    this.event(this.sdk.EventType.appOnHide, data);
  }

  appError(error: string) {
    const data = {
      on_error: error,
      session_id: this.sdk.sessionId,
    };

    this.sdk.emit(this.sdk.types.ExtendAppError, data);

    this.event(this.sdk.EventType.appOnError, data);
  }

  pageShow() {
    this.sessionDepth += 1;
    const { route, __route__, options: query = {} } = this.getCurrentPage();
    const path = route || __route__;
    const { EventType } = this.sdk;
    const pvInfo = {
      path,
      title: this.getPageTitle(path),
      session_id: this.sdk.sessionId,
      ...(this.scene ? { scene: this.scene } : {}),
      ...this.getQuery(query),
    };
    let lastPage = null;
    if (this.recentlyPage) {
      lastPage = this.recentlyPage;
    } else {
      const page = this.getRouteInfo(2);
      if (page) {
        lastPage = page;
      }
    }
    if (lastPage) {
      const { path: lastPath = '', query: lastQuery = {} } = lastPage;
      pvInfo['refer_path'] = lastPath;
      pvInfo['refer_query'] = JSON.stringify(lastQuery);
    }

    this.sdk.emit(this.sdk.types.ExtendPageShow, pvInfo);

    this.recentlyPage = {
      path,
      query,
    };
    this.currentPvInfo = {
      time: now(),
      params: {
        ...pvInfo,
      },
    };

    this.event(EventType.pageOnShow, pvInfo);
  }

  pageHide() {
    if (!this.currentPvInfo) {
      return;
    }
    const { time, params } = this.currentPvInfo;
    this.currentPvInfo = null;
    let duration = now() - time;
    duration = duration < 0 ? 0 : duration;

    const data = {
      ...(params || {}),
      duration,
    };

    this.sdk.emit(this.sdk.types.ExtendPageHide, data);

    this.event(this.sdk.EventType.pageOnHide, data);
  }

  pageShare(info: any) {
    const {
      user: { user_unique_id: userUniqueId },
    } = this.sdk.env.get();
    const shareDepth = this.shareDepth + 1;
    if (info.path) {
      let { path } = info;
      let hash = '';
      const indexOf = path.indexOf('#');
      if (indexOf !== -1) {
        hash = path.substr(indexOf);
        path = path.substr(0, indexOf);
      }
      const query = `from_user_unique_id=${userUniqueId}&share_depth=${shareDepth}&from_title=${info.title}`;
      path += `${path.indexOf('?') !== -1 ? '&' : '?'}${query}`;
      info.path = path + hash;
    }
    const { title, path = '' } = info;
    const data = {
      title,
      path,
      page_path: path.split('?')[0],
      query_share_depth: shareDepth,
      session_id: this.sdk.sessionId,
    };

    this.sdk.emit(this.sdk.types.ExtendPageShare, data);

    this.event(this.sdk.EventType.pageOnShareAppMessage, data);
    return {
      ...info,
      share_depth: shareDepth,
    };
  }

  pageFavorite(info: any) {
    const { res, result } = info || {};
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const { route, __route__ } = currentPage;
    const path = route || __route__;
    const { query, ...other } = result;
    const data = {
      url_path: res?.webViewUrl || path,
      url_query: query,
      ...other,
    };

    this.sdk.emit(this.sdk.types.ExtendPageFavorite, data);

    this.event(this.sdk.EventType.pageOnAddToFavorites, data);
  }
}

class NewAuto extends Auto {
  sessionStart: number = 0;
  sessionDepth: number = 0;
  shareDepth: number = 0;
  recentlyPage: any;
  currentPvInfo: any;

  appShow(info?: any) {}

  appHide() {}

  appError(error: string) {}

  pageShow() {}

  pageHide() {}

  pageShare(info: any) {}

  pageFavorite(info: any) {}
}

export default OldAuto;
