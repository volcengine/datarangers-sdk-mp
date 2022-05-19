// Copyright 2022 Beijing Volcanoengine Technology Ltd. All Rights Reserved.
declare const wx;
declare const tt;
declare const my;
declare const swan;
declare const qq;
declare const uni;

declare const __wxConfig;
declare const __ttConfig;
declare const __qqConfig;

const UNDEFINED = 'undefined';

let which: any = UNDEFINED;

export const getWhich = () => {
  if (which !== UNDEFINED) {
    return which;
  }
  which =
    typeof tt !== UNDEFINED
      ? {
          target: tt,
          config: typeof __ttConfig !== UNDEFINED ? __ttConfig : null,
          customPlatform: 'ttMiniProduct',
          mpPlatform: 2,
          is: 'tt',
        }
      : typeof my !== UNDEFINED
      ? {
          target: my,
          config: null,
          customPlatform: 'aliMiniProduct',
          mpPlatform: 1,
          is: 'my',
        }
      : typeof swan !== UNDEFINED
      ? {
          target: swan,
          config: null,
          customPlatform: 'swanMiniProduct',
          mpPlatform: 5,
          is: 'swan',
        }
      : typeof qq !== UNDEFINED
      ? {
          target: qq,
          config: typeof __qqConfig !== UNDEFINED ? __qqConfig : null,
          customPlatform: 'qqMiniProduct',
          mpPlatform: 6,
          is: 'qq',
        }
      : typeof wx !== UNDEFINED
      ? {
          target: wx,
          config: typeof __wxConfig !== UNDEFINED ? __wxConfig : null,
          customPlatform: 'miniProduct',
          mpPlatform: 0,
          is: 'wx',
        }
      : typeof uni !== UNDEFINED
      ? {
          target: uni,
          config: null,
          customPlatform: 'uniMiniProduct',
          mpPlatform: 7,
          is: 'uni',
        }
      : {
          target: {},
          config: null,
          customPlatform: '',
          mpPlatform: -1,
          is: '',
        };
  return which;
};
