// Copyright 2022 Beijing Volcanoengine Technology Ltd. All Rights Reserved.
import type Sdk from '../core/sdk';
import type { TOption } from '../core/option';

class Error {
  static pluginName: string = 'official:error';
  sdk: Sdk;
  options: TOption;
  enable: boolean = false;
  apply(sdk: Sdk, options: TOption) {
    this.sdk = sdk;
    this.options = options;
    const autoConfig = this.options['auto_report'];
    if (this.sdk.isObject(autoConfig) && !!autoConfig?.['catchError']) {
      this.enable = true;
    }
    if (!this.enable) {
      return;
    }

    const { target: which } = this.sdk;
    if (which) {
      // this.listenError(which);
      this.listenRejection(which);
      this.listenNotFound(which);
    }
  }

  listenError(which: any) {
    which?.onError((error: string) => {
      this.sdk.event('on_error', {
        on_error: error,
      });
    });
  }

  listenRejection(which: any) {
    which?.onUnhandledRejection((reason: string, promise: Promise<any>) => {
      this.sdk.event('on_unhandled_rejection', {
        reason,
      });
    });
  }

  listenNotFound(which: any) {
    which?.onPageNotFound((info: any) => {
      this.sdk.event('on_page_not_found', {
        info,
      });
    });
  }
}

export default Error;
