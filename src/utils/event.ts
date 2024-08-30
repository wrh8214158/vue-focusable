import { UP, DOWN, LEFT, RIGHT, ENTER, DBLENTER, LONGPRESS, BACK, defaultConfig } from './config';
import { getCurrFocusEl, next } from './core';
import { dispatchCustomEvent, getKey } from './common';
import type { DirectionString } from '../types/core.d';

// 长按的定时器
let longPressTimer: number | null = null;
// 长按的标识
let isLongPress = false;
// 双击的定时器
let dblenterTimer: number | null = null;
// 触摸元素
export let touchEl: Element | null = null;
// 点击的执行次数
let enterCount = 0;
// 滚动时间间隔
export const TIMEOUT = 16.67;
// 连点定时器
let scrollDelayTimer: number | null = null;
// 连点方向键的限制定时器
let scrollLimitTimer: number | null = null;
// 定时器
export const requestAnimationFrame =
  window.requestAnimationFrame || // @ts-expect-error requestAnimationFrame
  window.webkitRequestAnimationFrame || // @ts-expect-error webkitRequestAnimationFrame
  window.mozRequestAnimationFrame || // @ts-expect-error mozRequestAnimationFrame
  window.oRequestAnimationFrame || // @ts-expect-error oRequestAnimationFrame
  window.msRequestAnimationFrame ||
  function (callback) {
    return window.setTimeout(callback, TIMEOUT);
  };
// 取消定时器
export const cancelAnimationFrame =
  window.cancelAnimationFrame || // @ts-expect-error cancelAnimationFrame
  window.webkitCancelAnimationFrame || // @ts-expect-error webkitCancelAnimationFrame
  window.mozCancelAnimationFrame || // @ts-expect-error mozCancelAnimationFrame
  window.oCancelAnimationFrame || // @ts-expect-error oCancelAnimationFrame
  window.msCancelAnimationFrame ||
  function (callback) {
    return window.clearTimeout(callback);
  };

export const dealKeydown = (e: KeyboardEvent) => {
  const key = getKey(e);
  switch (key) {
    case UP:
    case RIGHT:
    case DOWN:
    case LEFT: {
      dealDirection(e, key);
      break;
    }
    case ENTER: {
      dealPressed(null, true);
      if (!longPressTimer) {
        longPressTimer = window.setTimeout(longpress, defaultConfig.longPressTime);
      }
      break;
    }
    default: {
      break;
    }
  }
};

export const dealKeyup = (e: KeyboardEvent) => {
  const key = getKey(e);
  switch (key) {
    case ENTER: {
      enterCount++;
      dealPressed(null, false);
      clearLongPressTimer();
      if (isLongPress) {
        clearDblenterTimer();
      } else {
        const { dblEnterTime } = defaultConfig;
        if (dblEnterTime) {
          !dblenterTimer && (dblenterTimer = window.setTimeout(dealEnter, dblEnterTime));
        } else {
          enter();
        }
      }
      isLongPress = false;
      break;
    }
    case BACK: {
      dealBack();
      break;
    }
    default: {
      break;
    }
  }
};

export const dealTouchstart = (e: TouchEvent) => {
  const { touchpad, itemAttrname } = defaultConfig;
  if (touchpad) {
    const target = e.target as HTMLElement;
    if (!touchEl && target.hasAttribute(itemAttrname)) {
      const pressEl = dealPressed(target, true);
      touchEl = pressEl;
      if (!longPressTimer) {
        longPressTimer = window.setTimeout(longpress, defaultConfig.longPressTime);
      }
    }
  }
};

export const dealTouchmove = () => {
  touchEl = null;
  clearLongPressTimer();
};

export const dealTouchend = (e: TouchEvent) => {
  const { touchpad, itemAttrname, dblEnterTime } = defaultConfig;
  if (touchpad) {
    clearLongPressTimer();
    const currFocusEl = getCurrFocusEl();
    if (currFocusEl) {
      const DIRECTION_ARR = [UP, RIGHT, DOWN, LEFT];
      for (let i = 0; i < DIRECTION_ARR.length; i++) {
        const item = DIRECTION_ARR[i];
        currFocusEl.removeAttribute(`${item}-count`);
      }
    }
    const target = e.target as HTMLElement;
    const pressEl = (touchEl && dealPressed(touchEl, false)) || null;
    if (target.hasAttribute(itemAttrname)) {
      if (touchEl && touchEl === pressEl) {
        enterCount++;
        if (isLongPress) {
          clearDblenterTimer();
        } else {
          if (dblEnterTime) {
            !dblenterTimer && (dblenterTimer = window.setTimeout(dealEnter, dblEnterTime));
          } else {
            enter();
          }
        }
        next(touchEl);
        isLongPress = false;
      }
    }
    touchEl = null;
  }
};

export const dealTouchcancel = () => {
  touchEl && dealPressed(touchEl, false);
};

const dealDirection = (e: Event, direction: DirectionString) => {
  e.preventDefault();
  clearScrollDelayTimer();
  const doScroll = () => {
    const { scrollDelay } = defaultConfig;
    if (scrollDelay) {
      if (!scrollLimitTimer) {
        scrollLimitTimer = window.setTimeout(() => {
          directionNext(direction);
          window.clearTimeout(scrollLimitTimer as number);
          scrollLimitTimer = null;
        }, scrollDelay);
      }
    } else {
      directionNext(direction);
    }
    clearScrollDelayTimer();
  };
  scrollDelayTimer = requestAnimationFrame(doScroll);
};

const directionNext = (direction: DirectionString) => defaultConfig.autoFocus && next(direction);

const dealPressed = (el: Element | null, flag: boolean) => {
  const currFocusEl = el || getCurrFocusEl();
  const { pressedAttrname } = defaultConfig;
  if (currFocusEl) {
    if (flag) {
      currFocusEl.setAttribute(pressedAttrname, '');
    } else {
      currFocusEl.removeAttribute(pressedAttrname);
    }
  }
  return currFocusEl;
};

const dealBack = () => dispatchCustomEvent(document, BACK);

const longpress = () => {
  const currFocusEl = getCurrFocusEl();
  currFocusEl && dispatchCustomEvent(currFocusEl, LONGPRESS);
  isLongPress = true;
};

const clearLongPressTimer = () => {
  clearTimeout(longPressTimer as number);
  longPressTimer = null;
};

const enter = () => {
  const currFocusEl = getCurrFocusEl();
  currFocusEl && dispatchCustomEvent(currFocusEl, ENTER);
};

const clearDblenterTimer = () => {
  clearTimeout(dblenterTimer as number);
  dblenterTimer = null;
  enterCount = 0;
};

const clearScrollDelayTimer = () => {
  cancelAnimationFrame(scrollDelayTimer as number);
  scrollDelayTimer = null;
};

const dealEnter = () => {
  switch (enterCount) {
    case 1: {
      // 单击
      enter();
      break;
    }
    case 2: {
      // 双击
      dblEnter();
      break;
    }
    default: {
      break;
    }
  }
  clearDblenterTimer();
};

const dblEnter = () => {
  const currFocusEl = getCurrFocusEl();
  currFocusEl && dispatchCustomEvent(currFocusEl, DBLENTER);
};
