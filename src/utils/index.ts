import { onLimitChange, setHiddenAttr, SCROLL_GROUP_RECORD } from './core';
import {
  SCROLL_ITEM_KEY,
  SCROLL_DIRECTION_KEY,
  SCROLL_GROUP_KEY,
  LIMIT_GROUP_KEY,
  LIMIT_ITEM_KEY,
  defaultConfig,
  PARENT_SCROLL_GROUP_KEY,
  SCROLL_RECORD_KEY,
  FOCUS_FIRST_KEY,
  SCROLL_FIND_FOCUS_TYPE_KEY,
  ROOT_SCROLL_KEY
} from './config';
import {
  dealKeydown,
  dealKeyup,
  dealTouchstart,
  dealTouchmove,
  dealTouchend,
  dealTouchcancel
} from './event';
import { ArrayIncludes } from './polyfill';
import { debounce } from './common';

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
    document.addEventListener(eventName, event, false);
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

export const dealScrollGroup = (
  el: HTMLElement,
  value: {
    direction?: 'x' | 'y';
    record?: boolean;
    focusFirst?: boolean;
    findFocusType?: number;
    needScrollHidden?: boolean;
    rootScroll?: boolean;
  }
) => {
  const { itemAttrname, scrollHiddenTime } = defaultConfig;
  const scrollDirection = {
    x: 'x',
    y: 'y'
  };
  const {
    direction = '',
    record = true,
    focusFirst = false,
    findFocusType = 1,
    needScrollHidden = false,
    rootScroll = true
  } = value || {};
  record ? el.setAttribute(SCROLL_RECORD_KEY, '') : el.removeAttribute(SCROLL_RECORD_KEY);
  focusFirst ? el.setAttribute(FOCUS_FIRST_KEY, '') : el.removeAttribute(FOCUS_FIRST_KEY);
  findFocusType === 0
    ? el.setAttribute(SCROLL_FIND_FOCUS_TYPE_KEY, '0')
    : el.removeAttribute(SCROLL_FIND_FOCUS_TYPE_KEY);
  rootScroll ? el.removeAttribute(ROOT_SCROLL_KEY) : el.setAttribute(ROOT_SCROLL_KEY, 'false');
  el.style.overflow = 'auto';
  if (needScrollHidden) {
    setHiddenAttr(el);
    el.onscroll = debounce(() => setHiddenAttr(el), scrollHiddenTime);
  }
  if (!el.hasAttribute(SCROLL_GROUP_KEY)) {
    scroll_group_count++;
    el.setAttribute(SCROLL_GROUP_KEY, String(scroll_group_count));
  }
  const currScrollGroupCount = el.getAttribute(SCROLL_GROUP_KEY) || '';
  const SCROLL_GROUP_KEY_ARR = el.querySelectorAll(`[${SCROLL_GROUP_KEY}]`);
  for (let i = 0; i < SCROLL_GROUP_KEY_ARR.length; i++) {
    const item = SCROLL_GROUP_KEY_ARR[i];
    item.setAttribute(PARENT_SCROLL_GROUP_KEY, currScrollGroupCount);
  }
  const ITEM_ATTRNAME_ARR = el.querySelectorAll(`[${itemAttrname}]`);
  for (let i = 0; i < ITEM_ATTRNAME_ARR.length; i++) {
    const item = ITEM_ATTRNAME_ARR[i];
    if (!item.hasAttribute(SCROLL_ITEM_KEY)) {
      item.setAttribute(SCROLL_ITEM_KEY, currScrollGroupCount);
      scrollDirection[direction] &&
        item.setAttribute(SCROLL_DIRECTION_KEY, scrollDirection[direction]);
    }
  }
};

export const unbindScrollGroup = (el: HTMLElement) => {
  const scrollGroupKey = el.getAttribute(SCROLL_GROUP_KEY);
  if (scrollGroupKey) {
    delete SCROLL_GROUP_RECORD[scrollGroupKey];
  }
};

export const dealLimitGroup = (el: HTMLElement, value: boolean = true) => {
  const { itemAttrname } = defaultConfig;
  if (!el.hasAttribute(LIMIT_GROUP_KEY)) {
    limit_group_count++;
    el.setAttribute(`${LIMIT_GROUP_KEY}`, String(limit_group_count));
  }
  const currLimitGroupCount = el.getAttribute(LIMIT_GROUP_KEY) || '';
  const ITEM_ATTRNAME_ARR = el.querySelectorAll(`[${itemAttrname}]`);
  for (let i = 0; i < ITEM_ATTRNAME_ARR.length; i++) {
    const item = ITEM_ATTRNAME_ARR[i];
    if (!item.hasAttribute(LIMIT_ITEM_KEY)) {
      item.setAttribute(LIMIT_ITEM_KEY, currLimitGroupCount);
    }
  }
  onLimitChange(el, value);
};
