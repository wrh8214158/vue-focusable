import { UP, DOWN, LEFT, RIGHT, ENTER, BACK, defaultConfig } from './config';
import { ArrayIncludes } from './polyfill';
import { requestAnimationFrame } from './event';

const DEFAULT_VERSION = 2;
let vueVersion = DEFAULT_VERSION;

export const getVueVersion = (Vue) =>
  (vueVersion = (Vue.version && +Vue.version.split('.')[0]) || DEFAULT_VERSION);

export const getDiffKey = () => {
  if (vueVersion >= 3) {
    return {
      mountedKey: 'mounted',
      updatedKey: 'updated',
      unmountedKey: 'unmounted'
    };
  } else {
    return {
      mountedKey: 'inserted',
      updatedKey: 'update',
      unmountedKey: 'unbind'
    };
  }
};

export const isDom = (el: Element) => el && el.nodeType === Node.ELEMENT_NODE;

export const calculateHypotenuse = (a: number = 0, b: number = 0) => Math.sqrt(a * a + b * b);

export const dispatchCustomEvent = (el: EventTarget, eventName = '', detail = {} as any) => {
  const patchEvent = () => el.dispatchEvent(createCustomEvent(eventName, detail));
  requestAnimationFrame(patchEvent);
};

export const createCustomEvent = (name: string, detail = {}) => {
  let evt;
  if (window.CustomEvent) {
    evt = new window.CustomEvent(name, { bubbles: true, cancelable: false, detail });
  } else {
    evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(name, true, false, detail);
  }
  return evt;
};

export const getKey = (e: KeyboardEvent | TouchEvent) => {
  const keyCode = (e as KeyboardEvent).keyCode || e.which;
  const { KEY_UP, KEY_RIGHT, KEY_DOWN, KEY_LEFT, KEY_ENTER, KEY_BACK } = defaultConfig;
  let eventName = '';
  if (ArrayIncludes(KEY_UP, keyCode)) {
    eventName = UP;
  } else if (ArrayIncludes(KEY_RIGHT, keyCode)) {
    eventName = RIGHT;
  } else if (ArrayIncludes(KEY_DOWN, keyCode)) {
    eventName = DOWN;
  } else if (ArrayIncludes(KEY_LEFT, keyCode)) {
    eventName = LEFT;
  } else if (ArrayIncludes(KEY_ENTER, keyCode)) {
    eventName = ENTER;
  } else if (ArrayIncludes(KEY_BACK, keyCode)) {
    eventName = BACK;
  }
  return eventName;
};

export const debounce = (func: (val?: any) => any, delay: number) => {
  let timer;
  return (args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};
