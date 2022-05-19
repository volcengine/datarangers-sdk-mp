// Copyright 2022 Beijing Volcanoengine Technology Ltd. All Rights Reserved.
import type Sdk from '../../core/sdk';
import type { TOption } from '../../core/option';

declare const getCurrentPages;
type TEventFunc = (event: string, params?: object) => void;

const Events = {
  mpLaunch: 'mp_launch',
  mpEnter: 'mp_enter',
  mpExit: 'mp_exit',
  purchase: 'purchase',
  query: 'query',
  updateLevel: 'update_level',
  createGameRole: 'create_gamerole',
  checkout: 'check_out',
  addToFavourite: 'add_to_favourite',
};

interface MPLaunchParams {
  launch_from: string;
}
const mpLaunch = (event: TEventFunc, params: MPLaunchParams) => {
  event(Events.mpLaunch, {
    ...params,
  });
};

let enterTime: number | undefined;
// 进入小程序
interface MpEnterParams {
  launch_from: string;
}
const mpEnter = (event: TEventFunc, params: MpEnterParams) => {
  enterTime = +new Date();
  event(Events.mpEnter, {
    ...params,
  });
};

// 退出小程序
interface MpExitParams {
  duration?: number;
  page_path?: string;
}
const mpExit = (event: TEventFunc, params: MpExitParams = {}) => {
  const pages = getCurrentPages();
  const page_path = pages[pages.length - 1].route;
  const duration = enterTime === undefined ? 0 : +new Date() - enterTime;
  event(Events.mpExit, {
    duration,
    page_path,
    ...params,
  });
  enterTime = undefined;
};

// 支付
interface PurchaseParams {
  content_type: string;
  content_name: string;
  content_id: string;
  content_num: number;
  payment_channel: string;
  currency: string;
  currency_amount: number;
  is_success: string;
  level: number;
}
const purchase = (event: TEventFunc, params: PurchaseParams) => {
  event(Events.purchase, {
    ...params,
  });
};

// 进行任务
interface QuestParams {
  quest_id: string;
  quest_type: string;
  quest_name: string;
  quest_no: number;
  is_success: string;
  description: string;
}
const quest = (event: TEventFunc, params: QuestParams) => {
  event(Events.query, {
    ...params,
  });
};

// 升级
interface UpdateLevelParams {
  level: number;
}
const updateLevel = (event: TEventFunc, params: UpdateLevelParams) => {
  event(Events.updateLevel, {
    ...params,
  });
};

// 创建角色
interface CreateGameRoleParams {
  gamerole_id: string;
}
const createGameRole = (event: TEventFunc, params: CreateGameRoleParams) => {
  event(Events.createGameRole, {
    ...params,
  });
};

// 下单
interface CheckoutParams {
  content_type: string;
  content_name: string;
  content_id: string;
  content_num: number;
  is_virtual_currency: string;
  virtual_currency: string;
  currency: string;
  currency_amount: number;
  is_success: string;
}
const checkout = (event: TEventFunc, params: CheckoutParams) => {
  event(Events.checkout, {
    ...params,
  });
};

// 添加至收藏
interface AddToFavouriteParams {
  content_type: string;
  content_name: string;
  content_id: string;
  content_num: number;
  is_success: string;
}
const addToFavourite = (event: TEventFunc, params: AddToFavouriteParams) => {
  event(Events.addToFavourite, {
    ...params,
  });
};

const methods = {
  mpLaunch,
  mpEnter,
  mpExit,
  purchase,
  quest,
  updateLevel,
  createGameRole,
  checkout,
  addToFavourite,
};

class Extend {
  static pluginName: string = 'official:extend';
  sdk: Sdk;
  options: TOption;
  apply(sdk: Sdk, options: TOption) {
    this.sdk = sdk;
    this.options = options;
    Object.keys(methods).forEach((method) => {
      this.sdk[method] = methods[method].bind(
        null,
        this.sdk.event.bind(this.sdk),
      );
    });
  }
}

export default Extend;
