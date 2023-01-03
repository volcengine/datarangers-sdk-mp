// Copyright 2022 Beijing Volcanoengine Technology Ltd. All Rights Reserved.
import type Sdk from '../core/sdk';
import type { TOption } from '../core/option';

class Apm {
  static pluginName: string = 'official:apm';
  static init(Sdk) {
    Sdk.prototype.autoInitializationRangers = function (
      config: TOption & {
        app_id: number;
        onTokenReady: (webId: string) => void;
      },
    ): void | Promise<string> {
      const { onTokenReady: callback, ...initOption } = config;
      this.init({
        ...initOption,
        log: false,
        enable_third: true,
      });
      this.send();
      return this.getToken().then((tokens) => {
        const { web_id: webId } = tokens;
        try {
          if (typeof callback === 'function') {
            callback(`${webId}`);
            return;
          }
        } catch (e) {}
        return `${webId}`;
      });
    };
  }

  apply(_: Sdk, __: TOption) {}
}

export default Apm;
