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
        !dblenterTimer &&
          (dblenterTimer = window.setTimeout(dealEnter, defaultConfig.dblEnterTime));
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
  const { touchpad, itemAttrname } = defaultConfig;
  if (touchpad) {
    clearLongPressTimer();
    const currFocusEl = getCurrFocusEl();
    currFocusEl &&
      [UP, RIGHT, DOWN, LEFT].forEach((item) => currFocusEl.removeAttribute(`${item}-count`));
    const target = e.target as HTMLElement;
    const pressEl = (touchEl && dealPressed(touchEl, false)) || null;
    if (target.hasAttribute(itemAttrname)) {
      if (touchEl && touchEl === pressEl) {
        enterCount++;
        if (isLongPress) {
          clearDblenterTimer();
        } else {
          !dblenterTimer &&
            (dblenterTimer = window.setTimeout(dealEnter, defaultConfig.dblEnterTime));
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

export const dealContextmenu = (e: Event) => {
  e.preventDefault();
};

const dealDirection = (e: Event, direction: DirectionString) => {
  e.preventDefault();
  defaultConfig.autoFocus && next(direction);
};

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

const dealBack = () => {
  dispatchCustomEvent(document, BACK);
};

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
