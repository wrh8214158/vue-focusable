import { onLimitChange } from './core';
import {
  SCROLL_ITEM_KEY,
  SCROLL_DIRECTION_KEY,
  SCROLL_GROUP_KEY,
  LIMIT_GROUP_KEY,
  LIMIT_ITEM_KEY,
  defaultConfig
} from './config';
import {
  dealKeydown,
  dealKeyup,
  dealTouchstart,
  dealTouchmove,
  dealTouchend,
  dealTouchcancel,
  dealContextmenu
} from './event';

let scroll_group_count = -1;
let limit_group_count = -1;

export const initEvent = () => {
  [
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
    },
    {
      eventName: 'contextmenu',
      event: dealContextmenu
    }
  ].forEach(({ eventName, event }: { eventName: string; event: any }) =>
    document.addEventListener(eventName, event)
  );
};

export const dealFocusable = (el: HTMLElement, value: boolean) => {
  const { itemAttrname } = defaultConfig;
  if ([undefined, true].includes(value)) {
    el.setAttribute(itemAttrname, '');
  } else {
    el.removeAttribute(itemAttrname);
  }
};

export const dealScrollGroup = (el: HTMLElement, value: 'x' | 'y') => {
  const { itemAttrname } = defaultConfig;
  el.style.overflow = 'auto';
  scroll_group_count++;
  const scrollDirection = {
    x: 'x',
    y: 'y'
  };
  el.setAttribute(`${SCROLL_GROUP_KEY}-${scroll_group_count}`, '');
  Array.from(el.querySelectorAll(`[${itemAttrname}]`)).forEach((item) => {
    item.setAttribute(SCROLL_ITEM_KEY, String(scroll_group_count));
    item.setAttribute(SCROLL_DIRECTION_KEY, scrollDirection[value] || 'both');
  });
};

export const dealLimitGroup = (el: HTMLElement, value: boolean) => {
  if (!el.hasAttribute(LIMIT_GROUP_KEY)) {
    const { itemAttrname } = defaultConfig;
    limit_group_count++;
    el.setAttribute(`${LIMIT_GROUP_KEY}`, String(limit_group_count));
    Array.from(el.querySelectorAll(`[${itemAttrname}]`)).forEach((item) => {
      item.setAttribute(LIMIT_ITEM_KEY, String(limit_group_count));
    });
  }
  onLimitChange(el, value);
};
