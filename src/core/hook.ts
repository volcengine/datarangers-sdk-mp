// Copyright 2022 Beijing Volcanoengine Technology Ltd. All Rights Reserved.
export type THookInfo = any;
export type THook = (hookInfo?: THookInfo) => void;
export interface IHooks {
  [key: string]: THook[];
}

class Hook {
  private hooks: IHooks;

  constructor() {
    this.hooks = {};
  }

  on(type: string, hook: THook) {
    if (!type || !hook || typeof hook !== 'function') {
      return;
    }
    if (!this.hooks[type]) {
      this.hooks[type] = [];
    }
    this.hooks[type].push(hook);
  }

  once(type: string, hook: THook) {
    if (!type || !hook || typeof hook !== 'function') {
      return;
    }
    const proxyHook: THook = (hookInfo: THookInfo) => {
      hook(hookInfo);
      this.off(type, proxyHook);
    };
    this.on(type, proxyHook);
  }

  off(type: string, hook?: THook) {
    if (!type || !this.hooks[type] || !this.hooks[type].length) {
      return;
    }
    if (hook) {
      const index = this.hooks[type].indexOf(hook);
      if (index !== -1) {
        this.hooks[type].splice(index, 1);
      }
    } else {
      this.hooks[type] = [];
    }
  }

  emit(type: string, info?: THookInfo) {
    if (!type || !this.hooks[type] || !this.hooks[type].length) {
      return;
    }
    [...this.hooks[type]].forEach((hook) => {
      try {
        hook(info);
      } catch (e) {}
    });
  }
}

export default Hook;
