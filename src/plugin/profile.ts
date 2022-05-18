import { now } from '../tool/time';
import { isObject, isArray, isNumber, isString } from '../tool/is';
import type Sdk from '../core/sdk';
import type { TEvent } from '../core/sdk';
import type { ProfileParams, ProfileIncrementParams } from '../core/sdk';
import type { TOption } from '../core/option';

class Profile {
  static pluginName: string = 'official:profile';
  sdk: Sdk;
  options: TOption;
  url: string = `/profile/list`;
  lastId: number = 0;
  lastOnceId: number = 0;
  duration: number = 60 * 1000;
  cache: Record<string, any> = {};
  buffer: any[] = [];
  apply(sdk: Sdk, options: TOption) {
    this.sdk = sdk;
    this.options = options;

    const { types } = this.sdk;
    this.sdk.on(types.ProfileSet, (params) => {
      this.check() && this.setProfile(params);
    });
    this.sdk.on(types.ProfileSetOnce, (params) => {
      this.check() && this.setOnceProfile(params);
    });
    this.sdk.on(types.ProfileUnset, (key) => {
      this.check() && this.unsetProfile(key);
    });
    this.sdk.on(types.ProfileIncrement, (params) => {
      this.check() && this.incrementProfile(params);
    });
    this.sdk.on(types.ProfileAppend, (params) => {
      this.check() && this.appendProfile(params);
    });
    this.sdk.on(types.ProfileClear, () => {
      this.cache = {};
    });
    this.sdk.on(types.Ready, () => {
      if (!this.buffer.length) {
        return;
      }
      this.reportMore([...this.buffer]);
      this.buffer = [];
    });
  }

  private check() {
    return !!this.options.enable_profile;
  }

  setProfile(params: ProfileParams): void {
    const result = this.debounce(params);
    if (!result) {
      return;
    }
    this.putCache(result);
    const filterResult = this.filter(result, (value) => {
      return (
        this.isString(value) || this.isNumber(value) || this.isArray(value)
      );
    });
    this.report(
      this.sdk.createEvent({
        event: '__profile_set',
        params: filterResult,
      }),
    );
  }

  setOnceProfile(params: ProfileParams) {
    const result = this.debounce(params, true);
    if (!result) {
      return;
    }
    this.putCache(result);
    const filterResult = this.filter(result, (value) => {
      return (
        this.isString(value) || this.isNumber(value) || this.isArray(value)
      );
    });
    this.report(
      this.sdk.createEvent({
        event: '__profile_set_once',
        params: filterResult,
      }),
    );
  }

  incrementProfile(params: ProfileIncrementParams) {
    if (!params) {
      return;
    }
    const result = this.filter(params, (value) => {
      return this.isNumber(value);
    });
    this.report(
      this.sdk.createEvent({
        event: '__profile_increment',
        params: result,
      }),
    );
  }

  unsetProfile(key: string) {
    if (!key || !this.isString(key)) {
      return;
    }
    const params = {};
    params[key] = '1';
    this.report(
      this.sdk.createEvent({
        event: '__profile_unset',
        params,
      }),
    );
  }

  appendProfile(params: ProfileParams) {
    if (!params || !this.isObject(params) || this.isEmpty(params)) {
      return;
    }
    const result = this.filter(params, (value) => {
      return this.isString(value) || this.isArray(value);
    });
    this.report(
      this.sdk.createEvent({
        event: '__profile_append',
        params: result,
      }),
    );
  }

  private reportMore(events: TEvent[]) {
    if (this.sdk.ready) {
      const data = this.sdk.env.merge(events, this.sdk.ProfileType);
      const { adapter, option } = this.sdk;
      adapter
        .request({
          url: `${option.get('domain')}${this.url}`,
          method: 'POST',
          data,
        })
        .then((response) => {
          this.sdk.emit(this.sdk.types.ProfileSubmitAfter, {
            isError: true,
            response,
            event: data,
          });
        })
        .catch((error) => {
          this.sdk.emit(this.sdk.types.ProfileSubmitError, {
            isError: true,
            error,
            event: data,
          });
        });
    } else {
      events.forEach((each) => {
        this.buffer.push(each);
      });
    }
  }

  private report(event: TEvent) {
    this.reportMore([event]);
  }

  private ms() {
    return now();
  }

  private debounce(
    params: ProfileParams,
    once: boolean = false,
  ): ProfileParams | undefined {
    if (!params || !this.isObject(params) || this.isEmpty(params)) {
      return;
    }
    let keys = Object.keys(params);
    const now = this.ms();
    const result = keys
      .filter((key) => {
        const cached = this.cache[key];
        if (
          cached &&
          (once ||
            (this.compare(cached.val, params[key]) &&
              now - cached.timestamp < this.duration))
        ) {
          return false;
        }
        return true;
      })
      .reduce((res, current) => {
        res[current] = params[current];
        return res;
      }, {});
    keys = Object.keys(result);
    if (!keys.length) {
      return;
    }
    return result;
  }

  private putCache(params: ProfileParams) {
    const now = this.ms();
    Object.keys(params).forEach((key) => {
      this.cache[key] = {
        val: this.clone(params[key]),
        timestamp: now,
      };
    });
  }

  private clone(value: any) {
    try {
      return JSON.parse(JSON.stringify(value));
    } catch (e) {
      return value;
    }
  }

  private compare(left: any, right: any) {
    return JSON.stringify(left) === JSON.stringify(right);
  }

  private filter(
    params: ProfileParams,
    cb: (value: any) => boolean,
  ): ProfileParams;
  private filter(
    params: ProfileIncrementParams,
    cb: (value: any) => boolean,
  ): ProfileIncrementParams;
  private filter(
    params: ProfileParams | ProfileIncrementParams,
    cb: (value: any) => boolean,
  ): ProfileParams | ProfileIncrementParams {
    const result = Object.keys(params).reduce((res, key) => {
      const value = params[key];
      if (cb(value)) {
        res[key] = value;
      }
      return res;
    }, {});
    return result;
  }

  private isObject(obj: any): boolean {
    return isObject(obj);
  }

  private isArray(obj: any): boolean {
    return isArray(obj);
  }

  private isNumber(obj: any): boolean {
    return isNumber(obj);
  }

  private isString(obj: any): boolean {
    return isString(obj);
  }

  private isEmpty(obj: any): boolean {
    const keys = Object.keys(obj);
    return !keys.length;
  }
}

export default Profile;
