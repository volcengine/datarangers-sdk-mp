// Copyright 2022 Beijing Volcanoengine Technology Ltd. All Rights Reserved.
import type Sdk from '../../core/sdk';
import type { TRequestArgs } from '../../core/adapter';

export default (target: any, needAbort: boolean = false) => (sdk: Sdk) => (
  args: TRequestArgs,
): Promise<any> => {
  const timeout = args.timeout || (sdk.option.get('request_timeout') as number);
  const needTimemout = typeof timeout === 'number' && timeout > 0;
  return new Promise((resolve, reject) => {
    const task = target.request({
      ...args,
      ...(needTimemout && !needAbort ? { timeout } : {}),
      dataType: args.dataType || 'json',
      success: (response: any) => {
        resolve(response);
      },
      fail: (info: any) => {
        reject(info);
      },
    });
    if (needTimemout && needAbort) {
      setTimeout(() => {
        try {
          task && task.abort();
        } catch (e) {}
      }, timeout);
    }
  });
};
