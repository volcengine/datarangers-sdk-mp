// Copyright 2022 Beijing Volcanoengine Technology Ltd. All Rights Reserved.
import Sdk from '../../core/sdk';
import Info from '../../plugin/info';
import Token from '../../plugin/token';
import Report from '../../plugin/report';
import Buffer from '../../plugin/buffer';
import Transform from '../../plugin/transform';
import Profile from '../../plugin/profile';

import { hashCode } from '../../tool/hash';
import {
  safeDecodeURIComponent,
  serializeUrl,
  unserializeUrl,
} from '../../tool/safe';

Sdk.usePlugin(Info);
Sdk.usePlugin(Token);
Sdk.usePlugin(Report);
Sdk.usePlugin(Buffer);
Sdk.usePlugin(Transform);
Sdk.usePlugin(Profile);

class MpSdk extends Sdk {
  appLaunch() {
    this.appShow();
  }

  appTerminate() {
    this.appHide();
  }

  appShow() {
    let info;
    if (typeof this.target.getLaunchOptionsSync !== 'undefined') {
      info = this.target.getLaunchOptionsSync();
    }
    this.emit(this.types.AppShow, info);
  }

  appHide() {
    this.emit(this.types.AppHide);
  }

  appError(error: string) {
    this.emit(this.types.AppError, error);
  }

  predefinePageview() {
    this.emit(this.types.PageShow);
  }

  predefinePageviewHide() {
    this.emit(this.types.PageHide);
  }

  shareAppMessage(info: any) {
    try {
      const autoPlugin = this.pluginInstances.find((pluginInstance) => {
        return (
          (pluginInstance.constructor as any).pluginName === 'official:auto'
        );
      });
      if (autoPlugin && typeof (autoPlugin as any).pageShare === 'function') {
        return (autoPlugin as any).pageShare(info);
      }
    } catch (e) {}
    return info;
  }

  setWebIDviaUnionID(unionId: string) {
    if (!unionId || !this.option.get('enable_custom_webid')) {
      return;
    }
    const webId = hashCode(String(unionId).trim());
    this.config({
      web_id: webId,
      wechat_unionid: unionId,
    });
  }

  setWebIDviaOpenID(openId: string) {
    if (!openId || !this.option.get('enable_custom_webid')) {
      return;
    }
    const webId = hashCode(String(openId).trim());
    this.config({
      web_id: webId,
      wechat_openid: openId,
    });
  }

  createWebViewUrl(url: string): string {
    if (!url || !this.ready) {
      return url;
    }
    const webId = this.env.get('web_id');
    if (!webId) {
      return url;
    }
    return this.processWebViewUrl(url, webId);
  }

  createWebViewUrlAsync(url: string): Promise<string> {
    if (!url) {
      return Promise.resolve(url as string);
    }
    if (this.ready) {
      return Promise.resolve(
        this.processWebViewUrl(url, this.env.get('web_id')),
      );
    } else {
      return new Promise((resolve) => {
        this.on(this.types.Ready, () => {
          resolve(this.processWebViewUrl(url, this.env.get('web_id')));
        });
      });
    }
  }

  private processWebViewUrl(url: string, webId: string): string {
    const key = `Web_ID`;
    url = safeDecodeURIComponent(url);
    const matchs = /([^?#]+)(\?[^#]*)?(#.*)?/.exec(url);
    const path = matchs[1] || '';
    const search = matchs[2] || '';
    const hash = matchs[3] || '';
    const qs = search ? unserializeUrl(search.substring(1)) : {};
    qs[key] = webId;
    url = path + serializeUrl('', qs) + hash;
    return url;
  }
}

export default MpSdk;
