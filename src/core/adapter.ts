import { isObject, isFunction } from '../tool/is';
import type Sdk from './sdk';

export interface AdapterLog {
  log: (...args: any[]) => void;
}

export interface AdapterRequest {
  (sdk: Sdk): (args: TRequestArgs) => Promise<any>;
}

export interface AdapterStorage {
  target?: any;
  new?(target?: any);
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<boolean>;
  remove(key: string): Promise<boolean>;
}

export type TRequestArgs = {
  url: string;
  data: object | any[];
  method?: 'POST' | 'GET';
  header?: object;
  dataType?: string;
  timeout?: number;
};

class Adapter {
  private _log: AdapterLog;
  private _request: ReturnType<AdapterRequest>;
  private _storage: AdapterStorage;

  private ready: boolean = false;
  private sdk: Sdk;

  constructor(sdk: Sdk) {
    this.sdk = sdk;
  }

  setLog(log: AdapterLog) {
    if (log && isFunction(log.log)) {
      this._log = log;
    }
  }

  setRequest(request: AdapterRequest) {
    if (isFunction(request)) {
      const _request = request(this.sdk);
      if (isFunction(_request)) {
        this._request = _request;
      }
    }
  }

  setStorage(storage: AdapterStorage) {
    if (
      isObject(storage) &&
      isFunction(storage.get) &&
      isFunction(storage.set) &&
      isFunction(storage.remove)
    ) {
      this._storage = storage;
    }
  }

  check() {
    if (!this._request || !this._storage) {
      //TODO 提示适配器未完全设置
      return;
    }
    this.ready = true;
  }

  log(...args: any[]) {
    if (!this._log) {
      return;
    }
    try {
      this.sdk.option.get('log') && this._log.log(...args);
    } catch (e) {}
  }

  request(args: TRequestArgs): Promise<any> {
    if (!this.ready) {
      return Promise.reject();
    }
    try {
      return this._request?.(args);
    } catch (e) {}
  }

  get(key: string): Promise<any> {
    if (!this.ready) {
      return Promise.reject(null);
    }
    return this._storage.get(key);
  }

  set(key: string, value: any): Promise<boolean> {
    if (!this.ready) {
      return Promise.reject(false);
    }
    return this._storage.set(key, value);
  }

  remove(key: string): Promise<boolean> {
    if (!this.ready) {
      return Promise.reject(false);
    }
    return this._storage.remove(key);
  }
}

export default Adapter;
