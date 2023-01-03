// Copyright 2022 Beijing Volcanoengine Technology Ltd. All Rights Reserved.
// https://stackoverflow.com/questions/246801/how-can-you-encode-a-string-to-base64-in-javascript
import type Sdk from '../core/sdk';
import type { TOption } from '../core/option';

class Encrypt {
  static pluginName: string = 'official:encrypt';
  sdk: Sdk;
  options: TOption;
  base64: string = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=`;
  base64Re: RegExp =
    // eslint-disable-next-line no-useless-escape
    /^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/;
  apply(sdk: Sdk, options: TOption) {
    this.sdk = sdk;
    this.options = options;
    if (!this.options.enable_encrypt) {
      return;
    }
    const { types } = this.sdk;
    this.sdk.on(types.DataEncrypt, (wrapData) => {
      wrapData.data = this.btoa(JSON.stringify(wrapData.data));
    });
  }
  btoa(str: string) {
    const b64 = this.base64;
    str = String(str);
    var bitmap,
      a,
      b,
      c,
      result = '',
      i = 0,
      rest = str.length % 3;
    for (; i < str.length; ) {
      if (
        (a = str.charCodeAt(i++)) > 255 ||
        (b = str.charCodeAt(i++)) > 255 ||
        (c = str.charCodeAt(i++)) > 255
      )
        throw new TypeError('fail btoa');
      bitmap = (a << 16) | (b << 8) | c;
      result +=
        b64.charAt((bitmap >> 18) & 63) +
        b64.charAt((bitmap >> 12) & 63) +
        b64.charAt((bitmap >> 6) & 63) +
        b64.charAt(bitmap & 63);
    }
    return rest ? result.slice(0, rest - 3) + '==='.substring(rest) : result;
  }

  // atob(str: string) {
  //   const b64 = this.base64;
  //   str = String(str).replace(/[\t\n\f\r ]+/g, '');
  //   if (!this.base64Re.test(str)) throw new TypeError('fail atob');
  //   str += '=='.slice(2 - (str.length & 3));
  //   var bitmap,
  //     result = '',
  //     r1,
  //     r2,
  //     i = 0;
  //   for (; i < str.length; ) {
  //     bitmap =
  //       (b64.indexOf(str.charAt(i++)) << 18) |
  //       (b64.indexOf(str.charAt(i++)) << 12) |
  //       ((r1 = b64.indexOf(str.charAt(i++))) << 6) |
  //       (r2 = b64.indexOf(str.charAt(i++)));
  //     result +=
  //       r1 === 64
  //         ? String.fromCharCode((bitmap >> 16) & 255)
  //         : r2 === 64
  //         ? String.fromCharCode((bitmap >> 16) & 255, (bitmap >> 8) & 255)
  //         : String.fromCharCode(
  //             (bitmap >> 16) & 255,
  //             (bitmap >> 8) & 255,
  //             bitmap & 255,
  //           );
  //   }
  //   return result;
  // }

  // b64Encode(str: string) {
  //   return window.btoa(encodeURIComponent(str));
  // }

  // b64Decode(b64: string) {
  //   return decodeURIComponent(window.atob(b64));
  // }
}

export default Encrypt;
