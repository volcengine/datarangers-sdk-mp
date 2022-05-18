import type Sdk from '../core/sdk';
import type { TOption } from '../core/option';

class Monitor {
  static pluginName: string = 'official:monitor';
  sdk: Sdk;
  options: TOption;
  reportUrl: string;
  apply(sdk: Sdk, options: TOption) {
    this.sdk = sdk;
    this.options = options;

    const { types } = this.sdk;

    if (!this.options.disable_sdk_monitor && !this.options.channel_domain) {
      this.sdk.on(types.Ready, () => {
        this.reportLoad();
      });
    }
  }

  reportLoad() {
    const env = this.sdk.env.get();
    const { user, header } = env;
    const data = this.sdk.env.merge([
      {
        event: 'onload',
        params: {
          ...user,
          ...header,
          ...this.options,
        },
      },
    ]);
    data[0].header.app_id = 1338;
    this.report(data);
  }

  report(data: any) {
    if (!this.reportUrl) {
      let reportUrl = this.sdk.get('report_url');
      if (!reportUrl) {
        return;
      }
      reportUrl += (reportUrl.indexOf('?') ? '&' : '?') + 'type=monitor';
      this.reportUrl = reportUrl;
    }
    this.sdk.adapter.request({
      url: this.reportUrl,
      method: 'POST',
      header: {
        'X-MCS-AppKey': `566f58151b0ed37e`,
      },
      data,
    });
  }
}

export default Monitor;
