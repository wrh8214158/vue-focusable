import type { DefaultConfig } from '../types/config.d';

// 滚动组和限制组属性名
export const SCROLL_GROUP_KEY = 'scroll-group';
export const SCROLL_DIRECTION_KEY = 'scroll-direction';
export const SCROLL_ITEM_KEY = 'scroll-item';
export const LIMIT_GROUP_KEY = 'limit-group';
export const LIMIT_ITEM_KEY = 'limit-item';

// 事件名映射
export const ONFOCUS = 'on-focus';
export const ONBLUR = 'on-blur';
export const UP = 'up';
export const DOWN = 'down';
export const LEFT = 'left';
export const RIGHT = 'right';
export const ENTER = 'enter';
export const DBLENTER = 'dblenter';
export const LONGPRESS = 'longpress';
export const BACK = 'back';

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
  smoothTime: 300,
  offsetDistanceX: 50,
  offsetDistanceY: 50,
  longPressTime: 700,
  dblEnterTime: 200,
  distanceToCenter: false,
  touchpad: true,
  autoFocus: true,
  setCountAttr: true
};
