// Copyright 2022 Beijing Volcanoengine Technology Ltd. All Rights Reserved.
import { decrypto } from '../tool/crypt';
import type Sdk from '../core/sdk';
import type { TEvent } from '../core/sdk';
import type { TOption } from '../core/option';

declare const setTimeout;

type UserInfo = {
  nickName: string;
  avatarUrl: string;
};
type HeaderType = {
  header: any;
  user: any;
};

class Verify {
  static pluginName: string = 'official:verify';
  sdk: Sdk;
  options: TOption;
  key: string = `start_rangers_data_check`;
  userInfo: UserInfo;
  buffer: TEvent[] = [];
  syncId: string;
  token: string;
  domain: string;
  test: boolean = false;
  testRequestNumber: number = 0;
  interval: number = 1000;
  host: any;
  needOn: boolean = false;
  onHandler: (data: any) => void = () => {};
  apply(sdk: Sdk, options: TOption) {
    this.sdk = sdk;
    this.options = options;

    if (this.options.disable_verify) {
      return;
    }

    const { types } = this.sdk;
    this.sdk.once(types.AppOpen, () => {
      try {
        this.host = this.sdk.target;
        if (this.host.getLaunchOptionsSync) {
          const info = this.host.getLaunchOptionsSync();
          const { query } = info;
          this.verify(query).then(() => {
            this.needOn = true;
            this.onHandler = (event) => {
              this.submit(event);
            };
            this.sdk.on(types.Event, this.onHandler);
          });
        }
      } catch (e) {}
    });

    this.sdk.on(types.AppClose, () => {
      if (this.needOn) {
        this.userInfo = null;
        this.sdk.off(types.Event, this.onHandler);
        this.onHandler = () => {};
        this.needOn = false;
      }
    });
  }

  private check(query: Record<string, any>): string {
    return query?.[this.key] ?? '';
  }

  private verify(query: any): Promise<boolean> {
    const { adapter } = this.sdk;
    let _resolve;
    const p = new Promise<boolean>((resolve) => {
      _resolve = resolve;
    });
    const verifyOpen = (userInfo?: any) => {
      _resolve(true);
      this.userInfo = userInfo || {
        nickName: '未知',
        avatarUrl: '',
      };
      adapter.log(`verify open ${JSON.stringify(this.userInfo)}`);
      this.login();
    };
    const cryptDomain = this.check(query);
    adapter.log(`verify ${cryptDomain}`);
    const that = this;
    if (cryptDomain) {
      try {
        const decryptDomain = decrypto('logverify')(cryptDomain);
        if (decryptDomain && /^https?:\/\//.test(decryptDomain)) {
          this.domain = decryptDomain;
        }
        adapter.log(`verify domain ${decryptDomain}`);
      } catch (e) {}
      that.host.getSetting({
        success(res: any) {
          adapter.log(`getSetting success`);
          if (res.authSetting['scope.userInfo']) {
            adapter.log(`getSetting scope.userInfo success`);
            if (that.host.getUserInfo) {
              that.host.getUserInfo({
                success(res: any) {
                  adapter.log(`getUserInfo success`);
                  const { nickName, avatarUrl } = res.userInfo;
                  verifyOpen({
                    nickName,
                    avatarUrl,
                  });
                },
                fail() {
                  adapter.log(`getUserInfo fail`);
                  verifyOpen();
                },
              });
            } else if (that.host.getOpenUserInfo) {
              that.host.getOpenUserInfo({
                success(res: any) {
                  adapter.log(`getUserInfo success`);
                  try {
                    const userInfo = JSON.parse(res.response).response;
                    const { nickName, avatar: avatarUrl } = userInfo;
                    verifyOpen({
                      nickName,
                      avatarUrl,
                    });
                  } catch (e) {}
                },
                fail() {
                  adapter.log(`getUserInfo fail`);
                  verifyOpen();
                },
              });
            }
          } else {
            adapter.log(`getSetting scope.userInfo fail`);
            verifyOpen();
          }
        },
        fail() {
          adapter.log(`getSetting fail`);
          verifyOpen();
        },
      });
    }
    return p;
  }

  private submit(event: TEvent | TEvent[]) {
    try {
      this.pushBuffer(JSON.parse(JSON.stringify(event)));
    } catch (e) {}
  }

  login() {
    if (!this.domain) {
      return;
    }
    const { header } = this.prepareHeader();
    this.sdk.adapter
      .request({
        url: `${this.domain}/simulator/limited_mobile/try_link`,
        method: 'POST',
        data: {
          header: {
            ...(header || {}),
            aid: header.app_id,
          },
          ...(this.userInfo ? { nick_name: this.userInfo.nickName } : {}),
          host_version: (header.custom || {}).mp_platform_app_version || '',
          sync_id: this.syncId || '',
        },
      })
      .then((res) => {
        try {
          const {
            data: {
              data: { retry, sync_id: syncId, token },
            },
          } = res;
          this.syncId = syncId;
          this.token = token;
          if (this.test && this.testRequestNumber > 3) {
            this.report();
            return;
          }
          if (retry === 0) {
          } else if (retry === 1) {
            this.loginLoop();
          } else if (retry === 2) {
            this.report();
          }
        } catch (e) {
          this.loginLoop();
        }
      })
      .catch(() => {
        this.loginLoop();
      });
  }

  private loginLoop() {
    this.test && this.testRequestNumber++;
    setTimeout(() => {
      this.login();
    }, this.interval);
  }

  report() {
    if (!this.domain) {
      return;
    }
    const { header } = this.prepareHeader();
    const events = this.buffer;
    this.buffer = [];
    this.sdk.adapter
      .request({
        url: `${this.domain}/simulator/limited_mobile/log`,
        method: 'POST',
        data: {
          header: {
            ...(header || {}),
            aid: header.app_id,
          },
          token: this.token || '',
          event_v3: events || [],
        },
      })
      .then((res) => {
        try {
          const {
            data: {
              data: { keep },
            },
          } = res;
          if (keep === true) {
            this.reportLoop();
          } else {
            this.reset();
          }
        } catch (e) {
          this.reportLoop();
        }
      })
      .catch(() => {
        this.reportLoop();
      });
  }

  private reportLoop() {
    setTimeout(() => {
      this.report();
    }, this.interval);
  }

  private pushBuffer(event: TEvent | TEvent[]) {
    (Array.isArray(event) ? [...event] : [event]).forEach((event) => {
      if (typeof event.params === 'string') {
        try {
          event.params = JSON.parse(event.params);
        } catch (e) {}
      }
      this.buffer.push(event);
    });
  }

  private prepareHeader(): HeaderType {
    const { env } = this.sdk;
    const { user, header } = env.get();
    const copy = JSON.parse(
      JSON.stringify({
        user,
        header,
      }),
    );
    return copy;
  }

  private reset() {
    this.buffer = [];
    this.syncId = '';
    this.token = '';
  }
}

export default Verify;
