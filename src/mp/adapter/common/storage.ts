// Copyright 2022 Beijing Volcanoengine Technology Ltd. All Rights Reserved.
import CommonStorage from '../storage';
import { getWhich } from './which';

declare const my;

const which = getWhich();

class Storage {
  get(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const result = my.getStorageSync({
          key,
        });
        resolve(result.data);
      } catch (e) {
        reject(e);
      }
    });
  }

  set(key: string, value: any): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        my.setStorageSync({
          key,
          data: value,
        });
        resolve(true);
      } catch (e) {
        reject(false);
      }
    });
  }

  remove(key: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        my.removeStorageSync({
          key,
        });
        resolve(true);
      } catch (e) {
        reject(false);
      }
    });
  }
}

export default which.is === 'my'
  ? new Storage()
  : which.target
  ? new CommonStorage(which.target)
  : (() => {
      const error = 'storage adapter error';
      return {
        get(key: string): Promise<any> {
          return Promise.reject(error);
        },
        set(key: string, value: any): Promise<boolean> {
          return Promise.reject(error);
        },
        remove(key: string): Promise<boolean> {
          return Promise.reject(error);
        },
      };
    })();
