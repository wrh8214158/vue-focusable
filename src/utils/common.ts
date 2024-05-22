import { UP, DOWN, LEFT, RIGHT, ENTER, BACK, defaultConfig } from './config';

const DEFAULT_VERSION = 2;
let vueVersion = DEFAULT_VERSION;

export const getVueVersion = (Vue) => {
  return (vueVersion = (Vue.version && parseInt(Vue.version.split('.')[0], 10)) || DEFAULT_VERSION);
};

export const getMountedKey = () => (vueVersion >= 3 ? 'mounted' : 'inserted');

export const isDom = (el: Element) => {
  return el && el.nodeType === Node.ELEMENT_NODE;
};

export const calculateHypotenuse = (a: number = 0, b: number = 0) => {
  return Math.sqrt(a * a + b * b);
};

export const dispatchCustomEvent = (el: EventTarget, eventName = '', detail = {} as any) => {
  el.dispatchEvent(createCustomEvent(eventName, detail));
};

export const createCustomEvent = (name: string, detail = {}) => {
  const evt = new CustomEvent(name, { bubbles: false, cancelable: false });
  for (const key in detail) {
    const value = detail[key];
    evt[key] = value;
  }
  return evt;
};

export const getKey = (e: KeyboardEvent | TouchEvent) => {
  const keyCode = (e as KeyboardEvent).keyCode || e.which;
  const { KEY_UP, KEY_RIGHT, KEY_DOWN, KEY_LEFT, KEY_ENTER, KEY_BACK } = defaultConfig;
  let eventName = '';
  if (KEY_UP.includes(keyCode)) {
    eventName = UP;
  } else if (KEY_RIGHT.includes(keyCode)) {
    eventName = RIGHT;
  } else if (KEY_DOWN.includes(keyCode)) {
    eventName = DOWN;
  } else if (KEY_LEFT.includes(keyCode)) {
    eventName = LEFT;
  } else if (KEY_ENTER.includes(keyCode)) {
    eventName = ENTER;
  } else if (KEY_BACK.includes(keyCode)) {
    eventName = BACK;
  }
  return eventName;
};

export const getDataType = (data: any) =>
  Object.prototype.toString.call(data).replace('[object ', '').replace(']', '');
