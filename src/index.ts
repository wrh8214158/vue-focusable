import { initEvent, dealFocusable, dealScrollGroup, dealLimitGroup } from './utils';
import { defaultConfig } from './utils/config';
import { getDiffKey, getVueVersion } from './utils/common';
import type { DefaultConfigPartial } from './types/config.d';
import {
  getCurrFocusEl,
  getFocusableEls,
  requestFocus,
  next,
  getNextFocusEl,
  doAnimate,
  getScrollEl,
  getLastFocusEl,
  getLimitGroupEl,
  limitGroupElsPush,
  limitGroupElsPop,
  onLimitChange,
  setAutoFocus,
  setDistanceToCenter,
  setOffsetDistance,
  setOffsetDistanceX,
  setOffsetDistanceY,
  setEndToNext
} from './utils/core';

declare const define: any;
declare const module: any;

initEvent();

const { mountedKey, updatedKey } = getDiffKey();

export const focusable = (data = {} as DefaultConfigPartial) => {
  // 初始化默认配置
  for (const key in data) {
    if (key in defaultConfig) {
      defaultConfig[key] = data[key];
    }
  }
  return {
    // 在绑定元素的父组件，及他自己的所有子节点都挂载完成后调用
    [mountedKey](el, binding) {
      dealFocusable(el, binding.value);
    },
    // 在绑定元素的父组件，及他自己的所有子节点都更新后调用
    [updatedKey](el, binding) {
      dealFocusable(el, binding.value);
    }
  };
};

export const scrollGroup = () => {
  return {
    // 在绑定元素的父组件，及他自己的所有子节点都挂载完成后调用
    [mountedKey](el, binding) {
      dealScrollGroup(el, binding.value);
    },
    // 在绑定元素的父组件，及他自己的所有子节点都更新后调用
    [updatedKey](el, binding) {
      dealScrollGroup(el, binding.value);
    }
  };
};

export const limitGroup = () => {
  return {
    // 在绑定元素的父组件，及他自己的所有子节点都挂载完成后调用
    [mountedKey](el, binding) {
      dealLimitGroup(el, binding.value);
    },
    // 在绑定元素的父组件，及他自己的所有子节点都更新后调用
    [updatedKey](el, binding) {
      dealLimitGroup(el, binding.value);
    }
  };
};

const install = (options = {} as DefaultConfigPartial) => ({
  install(Vue) {
    if ((install as any).installed) return;
    (install as any).installed = true;
    getVueVersion(Vue);
    const eventArr = [
      { key: 'focusable', value: focusable },
      { key: 'scrollGroup', value: scrollGroup },
      { key: 'limitGroup', value: limitGroup }
    ];
    for (let i = 0; i < eventArr.length; i++) {
      const { key, value } = eventArr[i];
      Vue.directive(key, value(options));
    }
  }
});

if (typeof module === 'object' && module.exports) {
  // 支持 CommonJS
  module.exports = install;
} else if (typeof define === 'function' && define.amd) {
  // 支持 AMD
  define([], install);
} else if ((window as any).Vue) {
  // Vue 是全局变量时
  (window as any).VueFocusable = install;
  const protoFunc = {
    getCurrFocusEl,
    getFocusableEls,
    next,
    getNextFocusEl,
    doAnimate,
    getScrollEl,
    getLastFocusEl,
    getLimitGroupEl,
    limitGroupElsPush,
    limitGroupElsPop,
    onLimitChange,
    setAutoFocus,
    setDistanceToCenter,
    setOffsetDistance,
    setOffsetDistanceX,
    setOffsetDistanceY,
    setEndToNext
  };
  for (const key in protoFunc) {
    (window as any).VueFocusable.__proto__[key] = protoFunc[key];
  }
}

export {
  getCurrFocusEl,
  getFocusableEls,
  requestFocus,
  next,
  getNextFocusEl,
  doAnimate,
  getScrollEl,
  getLastFocusEl,
  getLimitGroupEl,
  limitGroupElsPush,
  limitGroupElsPop,
  onLimitChange,
  setAutoFocus,
  setDistanceToCenter,
  setOffsetDistance,
  setOffsetDistanceX,
  setOffsetDistanceY,
  setEndToNext
};

export default install;
