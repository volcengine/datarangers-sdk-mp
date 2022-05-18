import type Sdk from '../../../core/sdk';
import type { TRequestArgs } from '../../../core/adapter';

declare const my;

export default (sdk: Sdk) => (args: TRequestArgs): Promise<any> => {
  const timeout = args.timeout || (sdk.option.get('request_timeout') as number);
  const needTimemout = typeof timeout === 'number' && timeout > 0;
  return new Promise((resolve, reject) => {
    const task = my[my.request ? 'request' : 'httpRequest']({
      ...args,
      dataType: args.dataType || 'json',
      success: (response: any) => {
        resolve(response);
      },
      fail: (info: any) => {
        reject(info);
      },
    });
    if (needTimemout) {
      setTimeout(() => {
        try {
          task && task.abort();
        } catch (e) {}
      }, timeout);
    }
  });
};
