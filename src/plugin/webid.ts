// Copyright 2022 Beijing Volcanoengine Technology Ltd. All Rights Reserved.
import type Sdk from '../core/sdk';
import type { TOption } from '../core/option';

import { hashCode } from '../tool/hash';
import {
  safeDecodeURIComponent,
  serializeUrl,
  unserializeUrl,
} from '../tool/safe';

function checkCustom(sdk) {
  if (!sdk.option.get('enable_custom_webid')) {
    sdk.adapter._log?.warn('需要开启enable_custom_webid');
    return false;
  }
  return true;
}

function process(url: string, webId: string): string {
  const key = `Web_ID`;
  if (
    url.indexOf(encodeURIComponent('https://')) === 0 ||
    url.indexOf(encodeURIComponent('http://')) === 0
  ) {
    url = safeDecodeURIComponent(url);
  }
  const matchs = /([^?#]+)(\?[^#]*)?(#.*)?/.exec(url);
  const path = matchs[1] || '';
  const search = matchs[2] || '';
  const hash = matchs[3] || '';
  const qs = search ? unserializeUrl(search.substring(1)) : {};
  qs[key] = webId;
  url = path + serializeUrl('', qs) + hash;
  return url;
}

class Webid {
  static pluginName: string = 'official:webid';
  static key: string = 'web_id';

  static init(Sdk) {
    Sdk.prototype.setWebId = function (id: string | number) {
      if (id == undefined || !checkCustom(this)) {
        return;
      }
      const webId = hashCode(`${id}`);
      this.config({
        web_id: `${webId}`,
      });
    };

    Sdk.prototype.setWebIDviaUnionID = function (unionId: string) {
      if (!unionId || !checkCustom(this)) {
        return;
      }
      const webId = hashCode(String(unionId).trim());
      this.config({
        web_id: `${webId}`,
        wechat_unionid: unionId,
      });
    };

    Sdk.prototype.setWebIDviaOpenID = function (openId: string) {
      if (!openId || !checkCustom(this)) {
        return;
      }
      const webId = hashCode(String(openId).trim());
      this.config({
        web_id: `${webId}`,
        wechat_openid: openId,
      });
    };

    Sdk.prototype.createWebViewUrl = function (url: string): string {
      if (!url || !this.ready) {
        return url;
      }
      const webId = this.env.get(Webid.key);
      if (!webId) {
        return url;
      }
      return process(url, webId);
    };

    Sdk.prototype.createWebViewUrlAsync = function (
      url: string,
    ): Promise<string> {
      if (!url) {
        return Promise.resolve(url as string);
      }
      if (this.ready) {
        return Promise.resolve(this.process(url, this.env.get(Webid.key)));
      } else {
        return new Promise((resolve) => {
          this.on(this.types.Ready, () => {
            resolve(process(url, this.env.get(Webid.key)));
          });
        });
      }
    };
  }

  apply(_: Sdk, __: TOption) {}
}

export default Webid;
