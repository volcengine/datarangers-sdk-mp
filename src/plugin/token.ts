import { isObject } from '../tool/is';
import type Sdk from '../core/sdk';
import type { TOption } from '../core/option';

interface IToken {
  storageNoData(): void;
  storageHasData(data: any): boolean;
  storageComplete(data: any): void;
}

enum TypeVal {
  Default = 'default',
  Custom = 'custom',
}

class DefaultToken implements IToken {
  url: string = `/webid/`;
  constructor(public wrap: Token, public sdk: Sdk) {}

  storageNoData() {
    this.fetch();
  }

  storageHasData(data: any): boolean {
    return this.wrap.dataComplete(data);
  }

  fetch(): void {
    const { adapter, appId } = this.sdk;
    adapter
      .request({
        url: this.sdk.getUrl(`${this.url}`),
        method: 'POST',
        data: {
          app_id: appId,
          url: '-',
          user_agent: '-',
          referer: '-',
          user_unique_id: '',
        },
      })
      .then((response) => {
        try {
          const { data: { e: code = -10000, web_id: webId = '' } = {} } =
            response;
          if (code === 0) {
            this.fetchComplete(webId);
            return;
          }
          adapter.log(`parse web_id error`, code);
        } catch (e) {
          adapter.log(`parse web_id error`, e);
        }
        this.fetchComplete();
      })
      .catch((info) => {
        this.fetchComplete();
        adapter.log(`fetch web_id error`, info);
      });
  }

  fetchComplete(webId?: string) {
    if (!webId) {
      return;
    }
    this.wrap.webIdComplete(webId);
  }

  storageComplete(data: any) {
    if (!data) {
      this.storageNoData();
      return;
    }
    try {
      if (data[this.wrap.typeKey] === TypeVal.Default) {
        const updateStorage = this.storageHasData(data);
        this.wrap.complete(updateStorage);
      } else {
        this.storageNoData();
      }
    } catch (e) {}
  }
}

class CustomToken implements IToken {
  waitResolve: (value?: any) => void;
  tmpWebId: string;
  constructor(public wrap: Token, public sdk: Sdk) {
    this.sdk.on(this.sdk.types.ConfigWebId, (webId: string) => {
      webId = `${webId}`;
      if (this.wrap.tokenComplete) {
        this.waitComplete(webId);
      } else {
        if (this.waitResolve) {
          this.waitResolve(webId);
        } else {
          this.tmpWebId = webId;
        }
      }
    });
  }

  storageNoData() {
    this.wait();
  }

  storageHasData(data: any): boolean {
    return this.wrap.dataComplete(data, this.tmpWebId);
  }

  wait() {
    new Promise<string>((resolve) => {
      if (this.tmpWebId !== undefined) {
        resolve(this.tmpWebId);
        this.tmpWebId = undefined;
      } else {
        this.waitResolve = resolve;
      }
    }).then((webId) => {
      this.waitComplete(webId);
    });
  }

  waitComplete(webId: string) {
    this.wrap.webIdComplete(webId);
  }

  storageComplete(data: any) {
    if (!data) {
      this.storageNoData();
      return;
    }
    try {
      if (data[this.wrap.typeKey] === TypeVal.Custom) {
        const updateStorage = this.storageHasData(data);
        this.wrap.complete(updateStorage);
      } else {
        this.storageNoData();
      }
    } catch (e) {}
  }
}

class Token {
  static pluginName: string = 'official:token';
  sdk: Sdk;
  options: TOption;
  key: string;
  tokenComplete: boolean = false;
  webId: string;
  userUniqueId: string;
  tmpUserUniqueId: string;
  token: IToken;
  tobid: string = '';
  tobidUrl: string = `/tobid/`;
  tobidKey: string = '';
  isCustom: boolean = false;
  typeKey: string = '_type_';
  apply(sdk: Sdk, options: TOption) {
    this.sdk = sdk;
    this.options = options;
    this.key = this.sdk.getKey('token');
    this.tobidKey = 'diss'.split('').reverse().join('');

    if (this.options['enable_custom_webid']) {
      this.isCustom = true;
      this.token = new CustomToken(this, this.sdk);
    } else {
      this.isCustom = false;
      this.token = new DefaultToken(this, this.sdk);
    }

    const { types } = this.sdk;
    this.sdk.on(types.ConfigUuid, (userUniqueId: string) => {
      this.setUserUniqueId(userUniqueId);
    });

    this.sdk.on(types.TokenGet, ({ callback }) => {
      const getTokens = () => {
        this.fetchTobid().then(() => {
          const user = this.sdk.env.get('user');
          const tokens = {
            ...user,
            web_id: this.webId,
            user_unique_id: this.userUniqueId,
          };
          tokens[this.tobidKey] = this.tobid;
          typeof callback === 'function' && callback(tokens);
        });
      };
      if (!this.sdk.ready) {
        this.sdk.once(types.Ready, () => {
          getTokens();
        });
      } else {
        getTokens();
      }
    });

    this.storage();
  }

  storage(): void {
    const { adapter } = this.sdk;
    adapter
      .get(this.key)
      .then((data) => {
        if (!isObject(data) || !data.web_id) {
          this.storageComplete(null);
          return;
        }
        if (
          !data[this.typeKey] ||
          data[this.tobidKey] ||
          !data.user_unique_id
        ) {
          data = {
            web_id: data.web_id,
            user_unique_id: data.user_unique_id || data.web_id,
          };
          adapter.set(this.key, data);
        }
        this.storageComplete(data);
      })
      .catch((info) => {
        this.storageComplete(null);
        adapter.log(`get token error`, info);
      });
  }

  storageComplete(data: any) {
    this.token.storageComplete(data);
  }

  dataComplete(data: any, tmpWebId?: string): boolean {
    let webId = data.web_id;
    if (tmpWebId !== undefined && tmpWebId !== webId) {
      webId = tmpWebId;
    }
    this.webId = webId;
    let userUniqueId =
      data.web_id === data.user_unique_id ? webId : data.user_unique_id;
    if (
      this.tmpUserUniqueId !== undefined &&
      this.tmpUserUniqueId !== userUniqueId
    ) {
      if (!this.tmpUserUniqueId) {
        userUniqueId = webId;
      } else {
        userUniqueId = this.tmpUserUniqueId;
      }
      this.tmpUserUniqueId = undefined;
    }
    this.userUniqueId = userUniqueId;
    return webId !== data.web_id || userUniqueId !== data.user_unique_id;
  }

  webIdComplete(webId: string) {
    this.webId = webId;
    if (this.tmpUserUniqueId) {
      this.userUniqueId = this.tmpUserUniqueId;
      this.tmpUserUniqueId = undefined;
    } else {
      this.userUniqueId = webId;
    }
    this.complete(true);
  }

  complete(updateStorage: boolean = false) {
    const { types } = this.sdk;
    const token = {
      web_id: this.webId,
      user_unique_id: this.userUniqueId,
    };
    this.sdk.env.set(token);
    token[this.typeKey] = this.isCustom ? TypeVal.Custom : TypeVal.Default;
    if (updateStorage) {
      this.sdk.adapter.set(this.key, token);
    }
    this.tokenComplete = true;
    this.sdk.emit(types.TokenComplete);
  }

  setUserUniqueId(userUniqueId: string): void {
    const { adapter, env, types } = this.sdk;
    if (this.tokenComplete) {
      if (this.userUniqueId === userUniqueId) {
        return;
      }
      this.sdk.emit(types.UuidChangeBefore);
      this.userUniqueId = userUniqueId || this.webId;
      env.set({
        user_unique_id: this.userUniqueId,
      });
      const token = {
        web_id: this.webId,
        user_unique_id: this.userUniqueId,
        [this.typeKey]: this.isCustom ? TypeVal.Custom : TypeVal.Default,
      };
      adapter.set(this.key, token);
      this.sdk.emit(types.UuidChangeAfter);
    } else {
      this.tmpUserUniqueId = userUniqueId;
    }
  }

  fetchTobid(): Promise<any> {
    const { adapter, appId } = this.sdk;
    return adapter
      .request({
        url: this.sdk.getUrl(`${this.tobidUrl}`),
        method: 'POST',
        data: {
          app_id: appId,
          web_id: this.webId,
          user_unique_id: this.userUniqueId,
        },
      })
      .then((response) => {
        try {
          const { data: { e: code = -10000, tobid = '' } = {} } = response;
          if (code === 0) {
            this.tobid = tobid;
            return;
          }
        } catch (e) {}
      })
      .catch((info) => {
        adapter.log(`fetch tobid error`, info);
      });
  }
}

export default Token;
