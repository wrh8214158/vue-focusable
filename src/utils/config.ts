import type { DefaultConfig } from '../types/config.d';

// 滚动组和限制组属性名
export const PARENT_SCROLL_GROUP_KEY = 'parent-scroll-group';
export const FOCUS_FIRST_KEY = 'focus-first';
export const SCROLL_FIND_FOCUS_TYPE_KEY = 'find-focus-type';
export const SCROLL_GROUP_KEY = 'scroll-group';
export const SCROLL_DIRECTION_KEY = 'scroll-direction';
export const SCROLL_RECORD_KEY = 'scroll-record';
export const SCROLL_RIGHT_HIDDEN_KEY = 'scroll-right-hidden';
export const SCROLL_BOTTOM_HIDDEN_KEY = 'scroll-bottom-hidden';
export const SCROLL_LEFT_HIDDEN_KEY = 'scroll-left-hidden';
export const SCROLL_TOP_HIDDEN_KEY = 'scroll-top-hidden';
export const ROOT_SCROLL_KEY = 'root-scroll';
export const SCROLL_ITEM_KEY = 'scroll-item';
export const LIMIT_GROUP_KEY = 'limit-group';
export const LIMIT_ITEM_KEY = 'limit-item';
export const NO_SCROLL_KEY = 'non-scrollable';

// 事件名映射
export const ONFOCUS = 'on-focus';
export const LOWCAMEL_ONFOCUS = 'onFocus';
export const ONBLUR = 'on-blur';
export const LOWCAMEL_ONBLUR = 'onBlur';
export const UP = 'up';
export const DOWN = 'down';
export const LEFT = 'left';
export const RIGHT = 'right';
export const ENTER = 'enter';
export const DBLENTER = 'dblenter';
export const LONGPRESS = 'longpress';
export const BACK = 'back';
export const SCROLL_OUT = 'scroll-out';
export const SCROLL_IN = 'scroll-in';

// 滚动方向
export const SCROLLTOP = 'scrollTop';
export const SCROLLLEFT = 'scrollLeft';

// 默认配置
export const defaultConfig: DefaultConfig = {
  KEY_LEFT: [37, 21],
  KEY_UP: [38, 19],
  KEY_RIGHT: [39, 22],
  KEY_DOWN: [40, 20],
  KEY_ENTER: [13, 23],
  KEY_BACK: [27, 10000],
  itemAttrname: 'focusable',
  focusClassName: 'focus',
  focusedAttrname: 'focused',
  pressedAttrname: 'pressed',
  easing: '',
  smoothTime: 800,
  offsetDistanceX: 50,
  offsetDistanceY: 50,
  longPressTime: 700,
  dblEnterTime: 200,
  scrollDelay: 0,
  scrollHiddenTime: 200,
  fps: false,
  distanceToCenter: false,
  touchpad: true,
  autoFocus: true,
  endToNext: false
};
