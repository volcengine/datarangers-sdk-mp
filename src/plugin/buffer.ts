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
  cacheEnable: boolean;
  cacheBatchNumber: number = 15;
  apply(sdk: Sdk, options: TOption) {
    this.sdk = sdk;
    this.options = options;
    this.enable = !!this.options.enable_buffer;
    this.cacheEnable = !!this.options.enable_cache;
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

    const { types } = this.sdk;
    this.sdk.on(types.Event, (event: TEvent | TEvent[]) => {
      const ets = Array.isArray(event) ? event : [event];
      if (!this.sdk.ready) {
        this.unReadyCache = [...this.unReadyCache, ...ets];
        if (
          this.cacheEnable &&
          this.unReadyCache.length >= this.cacheBatchNumber
        ) {
          this.sdk.emit(types.CacheUnReady, [...this.unReadyCache]);
          this.unReadyCache.length = 0;
        }
        return;
      }
      this.process(ets);
    });

    this.sdk.on(types.Ready, () => {
      if (this.unReadyCache.length > 0) {
        this.process(this.unReadyCache);
        this.unReadyCache.length = 0;
      }
    });

    this.sdk.on(types.Network, (networkStatus) => {
      if (!networkStatus.origin && networkStatus.current) {
        if (this.enable) {
          this.refresh();
        } else {
          if (this.buffer.length > 0) {
            this.report([...this.buffer]);
            this.buffer.length = 0;
          }
        }
      }
    });

    this.sdk.on(types.AppClose, () => {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = 0;
      }
      if (!this.sdk.ready) {
        if (this.cacheEnable && this.unReadyCache.length > 0) {
          this.sdk.emit(types.CacheUnReady, [...this.unReadyCache]);
          this.unReadyCache.length = 0;
        }
        return;
      }
      if (this.buffer.length > 0) {
        const network = this.network();
        if (network) {
          this.report([...this.buffer]);
        } else {
          if (this.cacheEnable) {
            this.sdk.emit(types.CacheBuffer, [...this.buffer]);
          }
        }
        this.buffer.length = 0;
      }
    });
  }

  private process(events: TEvent[]) {
    const eventData = this.sdk.env.compose(events);
    if (!this.network()) {
      this.buffer = [...this.buffer, eventData];
      if (this.cacheEnable && this.buffer.length >= this.cacheBatchNumber) {
        this.sdk.emit(this.sdk.types.CacheBuffer, [...this.buffer]);
        this.buffer.length = 0;
      }
    } else {
      if (this.enable) {
        this.buffer = [...this.buffer, eventData];
        this.refresh();
      } else {
        this.report(eventData);
      }
    }
  }

  private refresh() {
    if (this.buffer.length >= this.number) {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = 0;
      }
      this.report([...this.buffer]);
      this.buffer.length = 0;
    } else {
      if (!this.timer) {
        this.timer = setTimeout(() => {
          this.timer = 0;
          if (this.buffer.length > 0) {
            this.report([...this.buffer]);
            this.buffer.length = 0;
          }
        }, this.interval);
      }
    }
  }

  private report(event: TEventData | TEventData[]) {
    this.sdk.emit(this.sdk.types.Report, event);
  }

  private network(): boolean {
    if (this.options.enable_skip_network) {
      return true;
    }
    return !!this.sdk.env.get('is_connected');
  }
}

export default Buffer;
