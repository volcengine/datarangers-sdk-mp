export const isObject = (obj: any) =>
  obj != null && Object.prototype.toString.call(obj) == '[object Object]';

export const isFunction = (obj: any) => typeof obj === 'function';

export const isNumber = (obj: any) => typeof obj == 'number' && !isNaN(obj);

export const isString = (obj: any) => typeof obj == 'string';

export const isArray = (obj: any): boolean => {
  return typeof Array.isArray === 'function'
    ? Array.isArray(obj)
    : Object.prototype.toString.call(obj) === '[object Array]';
};
