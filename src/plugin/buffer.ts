// Copyright 2022 Beijing Volcanoengine Technology Ltd. All Rights Reserved.
import type Sdk from '../core/sdk';
import type { TEvent, TEventData } from '../core/sdk';
import type { TOption } from '../core/option';

declare const setTimeout;
declare const clearTimeout;
class Buffer {
  static pluginName: string = 'official:buffer';
  sdk: Sdk;
  options: TOption;
  interval: number;
  number: number;
  enable: boolean;
  buffer: TEventData[] = [];
  timer: number = 0;
  unReadyCache: TEvent[] = [];
  apply(sdk: Sdk, options: TOption) {
    this.sdk = sdk;
    this.options = options;
    this.enable = !!this.options.enable_buffer;
    const oldEnable =
      this.options.enable_storage === true ||
      this.options.disable_storage === false;
    if (oldEnable) {
      this.enable = true;
    }
    if (this.enable) {
      this.interval = this.options.buffer_interval;
      this.number = this.options.buffer_number;
      if (oldEnable) {
        if (this.options?.report_interval > 0) {
          this.interval = this.options.report_interval;
        }
        if (this.options?.max_batch_event > 0) {
          this.number = this.options.max_batch_event;
        }
      }
      try {
        this.interval = Number(this.interval);
        this.number = Number(this.number);
      } catch (e) {}
    }

    this.sdk.set('enable_storage', this.enable);

    const { types } = this.sdk;
    this.sdk.on(types.Event, (event: TEvent | TEvent[]) => {
      if (!this.sdk.ready) {
        this.unReadyCache = [
          ...this.unReadyCache,
          ...(Array.isArray(event) ? event : [event]),
        ];
        return;
      }
      this.process(Array.isArray(event) ? event : [event]);
    });

    this.sdk.on(types.Ready, () => {
      if (this.unReadyCache.length > 0) {
        this.process(this.unReadyCache);
        this.unReadyCache = [];
      }
    });

    this.sdk.on(types.AppClose, () => {
      if (this.buffer.length > 0) {
        this.report(this.buffer);
        this.buffer.length = 0;
      }
    });
  }

  private process(events: TEvent[]) {
    const eventData = this.sdk.env.compose(events);
    if (!this.enable) {
      this.report(eventData);
      return;
    }
    this.buffer = [...this.buffer, eventData];
    this.refresh();
  }

  private refresh() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    if (this.buffer.length >= this.number) {
      this.report([...this.buffer]);
      this.buffer.length = 0;
    } else {
      this.timer = setTimeout(() => {
        this.report([...this.buffer]);
        this.buffer.length = 0;
      }, this.interval);
    }
  }

  private report(event: TEventData | TEventData[]) {
    this.sdk.emit(this.sdk.types.Report, event);
  }
}

export default Buffer;
