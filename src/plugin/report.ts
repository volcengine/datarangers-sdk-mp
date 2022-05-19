// Copyright 2022 Beijing Volcanoengine Technology Ltd. All Rights Reserved.
import type Sdk from '../core/sdk';
import type { TEventData } from '../core/sdk';
import type { TOption } from '../core/option';

class Report {
  static pluginName: string = 'official:report';
  sdk: Sdk;
  options: TOption;
  url: string = `/list/`;
  key: string;
  cache: TEventData[] = [];
  reportUrl: string;
  pause: boolean = false;
  apply(sdk: Sdk, options: TOption) {
    this.sdk = sdk;
    this.options = options;
    this.key = this.sdk.getKey('report');
    this.reportUrl = this.sdk.getUrl(`${this.url}`);
    this.sdk.set('report_url', this.reportUrl);

    const { types } = this.sdk;
    this.sdk.on(types.Report, (event: TEventData | TEventData[]) => {
      if (!Array.isArray(event)) {
        event = [event];
      }
      if (!this.sdk.ready || this.pause) {
        event.forEach((each) => this.cache.push(each));
        return;
      }
      this.report(event);
    });

    this.sdk.on(types.Ready, () => {
      this.reportCache();
    });

    this.sdk.on(types.Pause, () => {
      this.pause = true;
    });

    this.sdk.on(types.CancelPause, () => {
      this.pause = false;
      this.reportCache();
    });

    const { adapter } = this.sdk;
    this.sdk.on(types.AppOpen, () => {
      adapter.get(this.key).then(() => {});
    });
    this.sdk.on(types.AppClose, () => {
      if (this.cache.length > 0) {
        adapter.set(this.key, [...this.cache]);
        this.cache.length = 0;
      }
    });
  }

  reportCache() {
    if (this.cache.length > 0) {
      this.report([...this.cache]);
      this.cache.length = 0;
    }
  }

  report(eventDatas: TEventData[]) {
    this.submit(eventDatas);
  }

  private submit(data: any) {
    const { types } = this.sdk;
    this.sdk.emit(types.SubmitBefore, data);
    this.sdk.adapter
      .request({
        url: this.reportUrl,
        method: 'POST',
        data,
      })
      .then((response) => {
        this.sdk.emit(types.SubmitAfter, {
          isError: false,
          response,
          event: data,
        });
      })
      .catch((error) => {
        this.sdk.emit(types.SubmitAfter, {
          isError: true,
          error,
          event: data,
        });
        this.sdk.emit(types.SubmitError, {
          event: data,
        });
      });
  }
}

export default Report;
