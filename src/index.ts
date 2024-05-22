import { initEvent, dealFocusable, dealScrollGroup, dealLimitGroup } from './utils';
import { defaultConfig } from './utils/config';
import { getMountedKey, getVueVersion } from './utils/common';
import type { DefaultConfig } from './types/config.d';
export * from './utils/core';

declare const define: any;
declare const exports: any;
declare const module: any;

initEvent();

export const focusable = (data = {} as DefaultConfig) => {
  Object.assign(defaultConfig, data);
  return {
    // 在绑定元素的父组件，及他自己的所有子节点都挂载完成后调用
    [getMountedKey()](el, binding) {
      dealFocusable(el, binding.value);
    },
    // 在绑定元素的父组件，及他自己的所有子节点都更新后调用
    updated(el, binding) {
      dealFocusable(el, binding.value);
    }
  };
};

export const scrollGroup = () => {
  return {
    // 在绑定元素的父组件，及他自己的所有子节点都挂载完成后调用
    [getMountedKey()](el, binding) {
      dealScrollGroup(el, binding.value);
    }
  };
};

export const limitGroup = () => {
  return {
    // 在绑定元素的父组件，及他自己的所有子节点都挂载完成后调用
    [getMountedKey()](el, binding) {
      dealLimitGroup(el, binding.value);
    },
    // 在绑定元素的父组件，及他自己的所有子节点都更新后调用
    updated(el, binding) {
      dealLimitGroup(el, binding.value);
    }
  };
};

const install = (options = {} as DefaultConfig) => ({
  install(Vue) {
    if ((install as any).installed) return;
    (install as any).installed = true;
    getVueVersion(Vue);
    const [FOCUSABLE, SCROLL_GROUP, LIMIT_GROUP] = ['focusable', 'scrollGroup', 'limitGroup'];
    [
      { key: FOCUSABLE, value: focusable },
      { key: SCROLL_GROUP, value: scrollGroup },
      { key: LIMIT_GROUP, value: limitGroup }
    ].forEach(({ key, value }) => {
      if (key === FOCUSABLE) {
        Vue.directive(key, value(options));
      } else {
        Vue.directive(key, value());
      }
    });
  }
});

if (typeof exports === 'object') {
  // 支持 CommonJS
  module.exports = (val: DefaultConfig) => install(val);
} else if (typeof define == 'function' && define.amd) {
  // 支持 AMD
  define([], (val: DefaultConfig) => install(val));
} else if ((window as any).Vue) {
  // Vue 是全局变量时，自动调用 Vue.use()
  (window as any).Vue.use((val: DefaultConfig) => install(val));
}

export default install;
