import { onLimitChange } from './core';
import {
  SCROLL_ITEM_KEY,
  SCROLL_DIRECTION_KEY,
  SCROLL_GROUP_KEY,
  LIMIT_GROUP_KEY,
  LIMIT_ITEM_KEY,
  defaultConfig,
  PARENT_SCROLL_GROUP_KEY
} from './config';
import {
  dealKeydown,
  dealKeyup,
  dealTouchstart,
  dealTouchmove,
  dealTouchend,
  dealTouchcancel
} from './event';
import { ArrayFrom, ArrayIncludes } from './polyfill';

let scroll_group_count = -1;
let limit_group_count = -1;

export const initEvent = () => {
  const arr = [
    {
      eventName: 'keydown',
      event: dealKeydown
    },
    {
      eventName: 'keyup',
      event: dealKeyup
    },
    {
      eventName: 'touchstart',
      event: dealTouchstart
    },
    {
      eventName: 'touchmove',
      event: dealTouchmove
    },
    {
      eventName: 'touchend',
      event: dealTouchend
    },
    {
      eventName: 'touchcancel',
      event: dealTouchcancel
    }
  ];
  for (let i = 0; i < arr.length; i++) {
    const { eventName, event } = arr[i] as { eventName: string; event: any };
    document.addEventListener(eventName, event);
  }
};

export const dealFocusable = (el: HTMLElement, value: boolean) => {
  const { itemAttrname } = defaultConfig;
  if (ArrayIncludes([undefined, true], value)) {
    el.setAttribute(itemAttrname, '');
  } else {
    el.removeAttribute(itemAttrname);
  }
};

export const dealScrollGroup = (el: HTMLElement, value: 'x' | 'y') => {
  const { itemAttrname } = defaultConfig;
  const scrollDirection = {
    x: 'x',
    y: 'y'
  };
  el.style.overflow = 'auto';
  if (!el.hasAttribute(SCROLL_GROUP_KEY)) {
    scroll_group_count++;
    el.setAttribute(SCROLL_GROUP_KEY, String(scroll_group_count));
  }
  const currScrollGroupCount = el.getAttribute(SCROLL_GROUP_KEY) || '';
  const SCROLL_GROUP_KEY_ARR = ArrayFrom(el.querySelectorAll(`[${SCROLL_GROUP_KEY}]`));
  for (let i = 0; i < SCROLL_GROUP_KEY_ARR.length; i++) {
    const item = SCROLL_GROUP_KEY_ARR[i];
    item.setAttribute(PARENT_SCROLL_GROUP_KEY, currScrollGroupCount);
  }
  const ITEM_ATTRNAME_ARR = ArrayFrom(el.querySelectorAll(`[${itemAttrname}]`));
  for (let i = 0; i < ITEM_ATTRNAME_ARR.length; i++) {
    const item = ITEM_ATTRNAME_ARR[i];
    if (!item.hasAttribute(SCROLL_ITEM_KEY)) {
      item.setAttribute(SCROLL_ITEM_KEY, currScrollGroupCount);
      scrollDirection[value] && item.setAttribute(SCROLL_DIRECTION_KEY, scrollDirection[value]);
    }
  }
};

export const dealLimitGroup = (el: HTMLElement, value: boolean) => {
  const { itemAttrname } = defaultConfig;
  if (!el.hasAttribute(LIMIT_GROUP_KEY)) {
    limit_group_count++;
    el.setAttribute(`${LIMIT_GROUP_KEY}`, String(limit_group_count));
  }
  const currLimitGroupCount = el.getAttribute(LIMIT_GROUP_KEY) || '';
  const ITEM_ATTRNAME_ARR = ArrayFrom(el.querySelectorAll(`[${itemAttrname}]`));
  for (let i = 0; i < ITEM_ATTRNAME_ARR.length; i++) {
    const item = ITEM_ATTRNAME_ARR[i];
    if (!item.hasAttribute(LIMIT_ITEM_KEY)) {
      item.setAttribute(LIMIT_ITEM_KEY, currLimitGroupCount);
    }
  }
  onLimitChange(el, value);
};
