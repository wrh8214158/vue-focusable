import { defaultConfig } from './utils/config';
import { getDiffKey, getVueVersion } from './utils/common';
import type { DefaultConfigPartial } from './types/config.d';
import {
  initEvent,
  dealFocusable,
  dealScrollGroup,
  unbindScrollGroup,
  dealLimitGroup
} from './utils';
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
  getDefaultConfig,
  limitGroupElsPush,
  limitGroupElsPop,
  onLimitChange,
  setAutoFocus,
  setDistanceToCenter,
  setOffsetDistance,
  setOffsetDistanceX,
  setOffsetDistanceY,
  setSmoothTime,
  setScrollDelay,
  setEndToNext,
  scrollingElement
} from './utils/core';

declare const define: any;
declare const module: any;

initEvent();

let _mountedKey, _updatedKey, _unmounted;

export const focusable = (data = {} as DefaultConfigPartial) => {
  // 初始化默认配置
  for (const key in data) {
    if (key in defaultConfig) {
      defaultConfig[key] = data[key];
    }
  }
  return {
    // 在绑定元素的父组件，及他自己的所有子节点都挂载完成后调用
    [_mountedKey](el, binding) {
      dealFocusable(el, binding.value);
    },
    // 在绑定元素的父组件，及他自己的所有子节点都更新后调用
    [_updatedKey](el, binding) {
      dealFocusable(el, binding.value);
    }
  };
};

export const scrollGroup = () => {
  return {
    // 在绑定元素的父组件，及他自己的所有子节点都挂载完成后调用
    [_mountedKey](el, binding) {
      dealScrollGroup(el, binding.value);
    },
    // 在绑定元素的父组件，及他自己的所有子节点都更新后调用
    [_updatedKey](el, binding) {
      dealScrollGroup(el, binding.value);
    },
    [_unmounted](el) {
      unbindScrollGroup(el);
    }
  };
};

export const limitGroup = () => {
  return {
    // 在绑定元素的父组件，及他自己的所有子节点都挂载完成后调用
    [_mountedKey](el, binding) {
      dealLimitGroup(el, binding.value);
    },
    // 在绑定元素的父组件，及他自己的所有子节点都更新后调用
    [_updatedKey](el, binding) {
      dealLimitGroup(el, binding.value);
    }
  };
};

const install = (options = {} as DefaultConfigPartial) => ({
  install(Vue) {
    if ((install as any).installed) return;
    (install as any).installed = true;
    getVueVersion(Vue);
    const { mountedKey, updatedKey, unmountedKey } = getDiffKey();
    _mountedKey = mountedKey;
    _updatedKey = updatedKey;
    _unmounted = unmountedKey;
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
    getDefaultConfig,
    limitGroupElsPush,
    limitGroupElsPop,
    onLimitChange,
    setAutoFocus,
    setDistanceToCenter,
    setOffsetDistance,
    setOffsetDistanceX,
    setOffsetDistanceY,
    setSmoothTime,
    setScrollDelay,
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
  getDefaultConfig,
  limitGroupElsPush,
  limitGroupElsPop,
  onLimitChange,
  setAutoFocus,
  setDistanceToCenter,
  setOffsetDistance,
  setOffsetDistanceX,
  setOffsetDistanceY,
  setSmoothTime,
  setScrollDelay,
  setEndToNext,
  scrollingElement
};

export default install;
