// Copyright 2022 Beijing Volcanoengine Technology Ltd. All Rights Reserved.
import type Sdk from '../core/sdk';
import type { TEvent } from '../core/sdk';
import type { TOption } from '../core/option';
import { now } from '../tool/time';

const TraceName = `applog_trace`;

enum Platform {
  Mp = 'mp',
  Quick = 'quick',
  QG = 'qg',
}

enum Key {
  Launch = 'launch',
  Terminate = 'terminate',
  Auto = 'auto',
  Event = 'event',
  LogData = 'log_data',
  Profile = 'profile',
}

enum State {
  Net = 'net',
  FailNet = 'f_net',
  FailData = 'f_data',
}

interface Prama {
  count: number;
  state: State;
  key: Key;
  params_for_special: typeof TraceName;
  platform: Platform;
  aid: number;
  duration?: number;
  _staging_flag: 1;
}

interface Parse {
  key: Key;
  state: State;
}

// type Cache = Map<Key, Map<State, Prama>>;
type Item = Record<State, Prama>;
type Cache = Record<Key, Item>;

class Trace {
  static pluginName: string = 'official:trace';
  sdk: Sdk;
  options: TOption;
  maxCount: number = 100;
  cache: Cache;
  platform: Platform = Platform.Mp;
  aid: number;
  isAuto: boolean;
  isPrivate: boolean;
  apply(sdk: Sdk, options: TOption) {
    this.sdk = sdk;
    this.options = options;

    this.aid = this.sdk.appId;
    this.isAuto = !!this.options.auto_report;
    this.isPrivate = !!this.options.channel_domain;

    const { types } = this.sdk;
    this.sdk.on(types.SubmitBefore, (data) => {
      if (this.isSkip()) {
        return;
      }
      if (this.isTest()) {
        return;
      }
      const info = this.parse(data);
      info.forEach((item) => {
        this.collect(item);
      });
    });

    this.sdk.on(types.SubmitAfter, (data) => {
      if (this.isSkip()) {
        return;
      }
      if (this.isTest()) {
        return;
      }
      const { isError, event } = data;
      const state = isError ? State.FailNet : State.FailData;
      const info = this.parse(
        [
          {
            events: event,
          },
        ],
        state,
      );
      if (state === State.FailData) {
        const { response } = data;
        const { data: responseData } = response;
        this.collect(
          {
            key: Key.Event,
            state,
          },
          responseData.sc || info.length,
        );
      } else {
        info.forEach((item) => {
          this.collect(item);
        });
      }
    });

    this.sdk.on(types.AppClose, () => {
      this.commit();
    });
  }

  private parse(data: any, stateType: State = State.Net): Parse[] {
    const parses: any[] = [];
    if (data) {
      data.forEach((each) => {
        const { events } = each;
        events.forEach((event) => {
          const { event: name } = event;
          if (name === TraceName) {
            return;
          }
          if (this.isTest(event)) {
            return;
          }
          parses.push({
            key: this.getKey(name),
            state: stateType,
          });
        });
      });
    }
    return parses;
  }

  private collect(item: Parse, num: number = 1) {
    const { key, state } = item;
    if (!this.cache) {
      this.cache = {} as Cache;
    }
    const { cache } = this;
    const createPrama = (num: number = 1): Prama => ({
      count: num,
      state,
      key,
      params_for_special: TraceName,
      platform: this.platform,
      aid: this.aid,
      _staging_flag: 1,
    });
    let currentCount = num;
    if (!cache[key]) {
      const stateMap = {} as Item;
      stateMap[state] = createPrama(num);
      cache[key] = stateMap;
    } else {
      const stateMap = cache[key];
      if (!stateMap[state]) {
        stateMap[state] = createPrama(num);
      } else {
        const whichState = stateMap[state];
        whichState.count += num;
        currentCount = whichState.count;
      }
    }
    if (currentCount >= this.maxCount) {
      this.critical(key, state);
    }
  }

  private report(cache: Cache) {
    if (!this.aid || !cache) {
      return;
    }
    const events: TEvent[] = [];
    Object.keys(cache).forEach((key) => {
      const stateMap = cache[key];
      if (stateMap) {
        Object.keys(stateMap).forEach((kk) => {
          const prama = stateMap[kk];
          if (!prama.aid) {
            prama.aid = this.aid;
          }
          const event = this.sdk.createEvent({
            event: TraceName,
            params: prama,
          });
          events.push(event);
        });
      }
    });
    if (events.length > 0) {
      this.sdk.event(events);
    }
  }

  private getKey(eventName: string): Key {
    const { EventType, ProfileType } = this.sdk;
    switch (eventName) {
      case EventType.appOnShow:
        return Key.Launch;
      case EventType.appOnHide:
        return Key.Terminate;
      default:
        if (Object.values(EventType).includes(eventName)) {
          return Key.Auto;
        }
        if (ProfileType.includes(eventName)) {
          return Key.Profile;
        }
        return Key.Event;
    }
  }

  private critical(key: Key, state: State) {
    // 当前策略先定：当其中某一个key + state达到阈值就整个cache上报
    this.commit();
  }

  private commit() {
    if (this.isSkip()) {
      return;
    }
    if (this.isTest()) {
      return;
    }
    const cache = this.cache;
    this.cache = null;
    this.report(cache);
  }

  private isSkip() {
    return this.isPrivate;
  }

  private isTest(event?: any): boolean {
    if (event) {
      return !!JSON.parse(event.params)?._staging_flag;
    }
    return !!this.sdk.env.get('evtParams')?._staging_flag;
  }
}

export default Trace;
