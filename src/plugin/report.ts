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
  eventName: string = `request_status__`;
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

    this.sdk.on(types.ReportSoon, (event: TEventData | TEventData[]) => {
      if (!Array.isArray(event)) {
        event = [event];
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

  private submit(data: TEventData[]) {
    const { types } = this.sdk;
    this.sdk.emit(types.SubmitBefore, data);
    const enableEncrypt = !!this.options.enable_encrypt;
    const wrapData = {
      data,
    };
    if (enableEncrypt) {
      this.sdk.emit(types.DataEncrypt, wrapData);
    }
    const reportUrl = this.changeReportUrl(enableEncrypt);

    this.sdk.adapter
      .request({
        url: reportUrl,
        method: 'POST',
        data: (enableEncrypt ? `data=${wrapData.data}` : data) as any,
      })
      .then((response) => {
        this.sdk.emit(types.SubmitAfter, {
          isError: false,
          response,
          event: data,
        });
        try {
          if (this.checkMonitor(data)) {
            return;
          }
          const { data: responseData, statusCode } = response;
          if (responseData.e !== 0) {
            const events = data.map((item) => {
              return item?.events;
            });
            this.reportMonitor({
              status_code: statusCode,
              response_data: JSON.stringify(responseData),
              event_info: JSON.stringify(events),
            });
          }
        } catch (e) {}
      })
      .catch((error) => {
        this.sdk.emit(types.SubmitAfter, {
          isError: true,
          error,
          event: data,
        });
        try {
          if (this.checkMonitor(data)) {
            return;
          }
          this.sdk.emit(types.SubmitError, {
            event: data,
          });
        } catch (e) {}
      });
  }

  reportMonitor(params: any) {
    const eventData = this.sdk.createEvent({
      event: this.eventName,
      params,
    });
    const data = this.sdk.env.merge([eventData]);
    this.submit(data);
  }

  checkMonitor(data: TEventData[]): boolean {
    if (
      data &&
      data[0] &&
      data[0].events[0] &&
      data[0].events[0].event === this.eventName
    ) {
      return true;
    }
    return false;
  }

  changeReportUrl(enableEncrypt: boolean) {
    if (!enableEncrypt) {
      return this.reportUrl;
    }
    return this.reportUrl + '&encryption=1';
  }
}

export default Report;
