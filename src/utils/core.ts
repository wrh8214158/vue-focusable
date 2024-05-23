import TWEEN from '@tweenjs/tween.js';
import { touchEl } from './event';
import { isDom, calculateHypotenuse, dispatchCustomEvent, getDataType } from './common';
import type { Next, DirectionString, NextObject } from '../types/core.d';
import {
  SCROLL_GROUP_KEY,
  SCROLL_DIRECTION_KEY,
  SCROLL_ITEM_KEY,
  LIMIT_GROUP_KEY,
  LIMIT_ITEM_KEY,
  ONFOCUS,
  ONBLUR,
  UP,
  DOWN,
  LEFT,
  RIGHT,
  defaultConfig,
  SCROLLTOP,
  SCROLLLEFT
} from './config';

const HTML = document.documentElement;
const BODY = document.body;
// 上一次落焦的元素
let lastFocusEl: Element | null = null;
// 上一次的方向
let lastDirection = '';
// 当前方向
let currDirection = '';
// 方向计数器
let counter = 0;
// 滚动动画的定时器
let scrollTimer: number | null = null;
// 滚动时间间隔
const TIMEOUT = 1000 / 60;
// next执行的次数
let directionCount = 0;
// 是否按方向键的标识
let directionFlag = false;
// 限制组元素集合
let limitGroupEls: Element[] = [];
// 定时器
const requestAnimationFrame =
  window.requestAnimationFrame || // @ts-expect-error requestAnimationFrame
  window.webkitRequestAnimationFrame || // @ts-expect-error webkitRequestAnimationFrame
  window.mozRequestAnimationFrame || // @ts-expect-error mozRequestAnimationFrame
  window.oRequestAnimationFrame || // @ts-expect-error oRequestAnimationFrame
  window.msRequestAnimationFrame ||
  function (callback) {
    window.setTimeout(callback, TIMEOUT);
  };
// 取消定时器
const cancelAnimationFrame =
  window.cancelAnimationFrame || // @ts-expect-error cancelAnimationFrame
  window.webkitCancelAnimationFrame || // @ts-expect-error webkitCancelAnimationFrame
  window.mozCancelAnimationFrame || // @ts-expect-error mozCancelAnimationFrame
  window.oCancelAnimationFrame || // @ts-expect-error oCancelAnimationFrame
  window.msCancelAnimationFrame ||
  function (callback) {
    window.clearTimeout(callback);
  };

export const getCurrFocusEl = () => {
  const { focusClassName, itemAttrname } = defaultConfig;
  const limitGroup = getLimitGroupEl();
  return limitGroup.querySelector(`.${focusClassName}[${itemAttrname}]`);
};

export const getFocusableEls = () => {
  const { itemAttrname } = defaultConfig;
  const limitGroup = getLimitGroupEl();
  const currFocusEl = getCurrFocusEl();
  const scrollItemKey = currFocusEl?.getAttribute(SCROLL_ITEM_KEY);
  const scrollItemAttr = `[${SCROLL_ITEM_KEY}="${scrollItemKey}"]`;
  const scrollEls = [...document.querySelectorAll(`[${itemAttrname}]${scrollItemAttr}`)];
  const otherEls = [...limitGroup.querySelectorAll(`[${itemAttrname}]:not(${scrollItemAttr})`)];
  return {
    scrollEls,
    otherEls
  };
};

export const next = (el: Next) => {
  if (!defaultConfig.autoFocus) {
    directionCount = 0;
    return;
  }
  directionCount++;
  const currFocusEl = getCurrFocusEl();
  if ([UP, RIGHT, DOWN, LEFT].includes(el as unknown as string)) {
    lastDirection = currDirection;
    currDirection = el as string;
    const nextFocusEl = getNextFocusEl(el as DirectionString);
    const currScrollGroupEl = dealScrollDirection({ currFocusEl, nextFocusEl, direction: el });
    const nextEl = currScrollGroupEl || nextFocusEl;
    const flag = nextInNext({ currFocusEl, nextFocusEl: nextEl, direction: el });
    !flag && next({ el: nextEl });
  } else if (
    isDom(
      (el as unknown as { $el: Element })?.$el ||
        (el as unknown as { target: Element })?.target ||
        el
    )
  ) {
    next({ el: el as unknown as Element });
  } else if ((el as NextObject)?.el) {
    const { focusClassName, focusedAttrname, setCountAttr } = defaultConfig;
    const config = el as NextObject;
    const currEl =
      (config.el as { $el: Element })?.$el ||
      (config.el as { target: Element })?.target ||
      config.el;
    let target: Element | null = null;
    if ([UP, RIGHT, DOWN, LEFT].includes(currEl as unknown as string)) {
      lastDirection = currDirection;
      currDirection = currEl as unknown as string;
      const nextFocusEl = getNextFocusEl(el as DirectionString);
      nextInNext({ currFocusEl, nextFocusEl, direction: el });
      target = nextFocusEl;
    } else {
      target = currEl as Element;
    }
    const sameTarget = lastFocusEl === target;
    if (!target.hasAttribute(LIMIT_ITEM_KEY)) {
      if (currFocusEl) {
        currFocusEl.classList.remove(focusClassName);
        currFocusEl.removeAttribute(focusedAttrname);
        !sameTarget && dispatchCustomEvent(currFocusEl, ONBLUR);
      }
    } else {
      const limitItemKey = target.getAttribute(LIMIT_ITEM_KEY);
      const limitGroup = document.querySelector(`[${LIMIT_GROUP_KEY}="${limitItemKey}"]`);
      if (limitGroup) {
        if (currFocusEl && limitGroup.contains(currFocusEl)) {
          currFocusEl.classList.remove(focusClassName);
          currFocusEl.removeAttribute(focusedAttrname);
          !sameTarget && dispatchCustomEvent(currFocusEl, ONBLUR);
        }
      }
    }
    target.classList.add(focusClassName);
    target.setAttribute(focusedAttrname, '');
    const { smooth, distanceToCenter, smoothTime, end, offsetDistanceX, offsetDistanceY } = config;
    !sameTarget && dispatchCustomEvent(target, ONFOCUS);
    setCountAttr && dealCount({ currFocusEl, nextFocusEl: target });
    lastFocusEl = target;
    directionFlag = false;
    doAnimate({
      focusEl: target,
      smooth,
      smoothTime,
      end,
      distanceToCenter,
      offsetDistanceX,
      offsetDistanceY
    });
    const scrollItemKey = target.getAttribute(SCROLL_ITEM_KEY);
    const scrollGroup = scrollItemKey
      ? document.querySelector(`[${SCROLL_GROUP_KEY}="${scrollItemKey}"]`)
      : null;
    if (scrollGroup) {
      doAnimate({
        focusEl: scrollGroup,
        scrollEl: getRootScrollEl(),
        smooth,
        smoothTime,
        end,
        distanceToCenter,
        offsetDistanceX,
        offsetDistanceY
      });
    }
  }
};

export const getNextFocusEl = (direction: DirectionString) => {
  const currFocusEl = getCurrFocusEl();
  const { scrollEls, otherEls } = getFocusableEls();
  if (currFocusEl) {
    switch (direction) {
      case LEFT:
      case RIGHT:
      case UP:
      case DOWN: {
        return (
          dealIntersectedEl({ currFocusEl, focusableEls: scrollEls, direction }) ||
          dealIntersectedEl({ currFocusEl, focusableEls: otherEls, direction }) ||
          currFocusEl ||
          null
        );
      }
      default: {
        return currFocusEl || null;
      }
    }
  } else {
    return (document.querySelector(`[${defaultConfig.itemAttrname}]`) as Element) || null;
  }
};

const dealIntersectedEl = ({ currFocusEl, focusableEls, direction }) => {
  const {
    top: originTop,
    right: originRight,
    bottom: originBottom,
    left: originLeft,
    width: originWidth,
    height: originHeight
  } = currFocusEl.getBoundingClientRect();
  const ORIGIN_NUM = Infinity;
  // 有相交的下一个元素元组
  let intersectedFinalFocusElTuple: [number, Element | null] = [ORIGIN_NUM, null];
  // 无相交的下一个元素元组
  let notIntersectedFinalFocusElTuple: [number, Element | null] = [ORIGIN_NUM, null];
  focusableEls.forEach((el) => {
    const {
      top: currTop,
      right: currRight,
      bottom: currBottom,
      left: currLeft,
      width: currWidth,
      height: currHeight
    } = el.getBoundingClientRect();
    const sameSideMap = {
      left: currLeft < originLeft,
      right: currRight > originRight,
      up: currTop < originTop,
      down: currBottom > originBottom
    };
    const isIntersected = ((direction) => {
      const leftRight = () =>
        (currTop >= originTop && currTop <= originBottom) ||
        (currBottom >= originTop && currBottom <= originBottom);
      const upDown = () =>
        (currLeft >= originLeft && currLeft <= originRight) ||
        (currRight >= originLeft && currRight <= originRight);
      return {
        left: leftRight,
        right: leftRight,
        up: upDown,
        down: upDown
      }[direction]();
    })(direction);
    if (el !== currFocusEl && sameSideMap[direction] && currWidth && currHeight) {
      // 斜边长
      const sideLen = calculateHypotenuse(
        originWidth / 2 + originLeft - (currWidth / 2 + currLeft),
        originHeight / 2 + originTop - (currHeight / 2 + currTop)
      );
      if (isIntersected) {
        // 相交
        if (sideLen < intersectedFinalFocusElTuple[0]) {
          intersectedFinalFocusElTuple = [sideLen, el];
        }
      } else {
        if (intersectedFinalFocusElTuple[0] === ORIGIN_NUM) {
          // 如果相交里有值，则不再计算不相交的值
          if (sideLen < notIntersectedFinalFocusElTuple[0]) {
            notIntersectedFinalFocusElTuple = [sideLen, el];
          }
        }
      }
    }
  });
  return intersectedFinalFocusElTuple[1] || notIntersectedFinalFocusElTuple[1] || null;
};

export const doAnimate = ({
  focusEl,
  scrollEl = null,
  smooth = true,
  smoothTime = undefined,
  end = undefined,
  easing = undefined,
  distanceToCenter = undefined,
  offsetDistanceX = undefined,
  offsetDistanceY = undefined
}: {
  focusEl: Element | null;
  scrollEl?: Element | null;
  smooth?: boolean;
  smoothTime?: number;
  end?: () => void;
  easing?: string | Function;
  distanceToCenter?: boolean;
  offsetDistanceX?: number;
  offsetDistanceY?: number;
}) => {
  const {
    offsetDistanceX: offsetDistanceSx,
    offsetDistanceY: offsetDistanceSy,
    distanceToCenter: sDistanceToCenter
  } = defaultConfig;
  const {
    top: focusTop = 0,
    right: focusRight = 0,
    bottom: focusBottom = 0,
    left: focusLeft = 0,
    width: focusWidth = 0,
    height: focusHeight = 0
  } = focusEl?.getBoundingClientRect() || {};
  const currScrollEl = (scrollEl || limitGroupEls.slice(-1)[0] || getScrollEl()) as HTMLElement;
  const {
    top: focusScrollTop = 0,
    right: focusScrollRight = 0,
    bottom: focusScrollBottom = 0,
    left: focusScrollLeft = 0,
    width: focusScrollWidth = 0,
    height: focusScrollHeight = 0
  } = currScrollEl?.getBoundingClientRect() || {};
  const { offsetDistanceDx, offsetDistanceDy } =
    distanceToCenter ?? sDistanceToCenter
      ? {
          offsetDistanceDx: (focusScrollWidth - focusWidth) / 2,
          offsetDistanceDy: (focusScrollHeight - focusHeight) / 2
        }
      : {
          offsetDistanceDx: offsetDistanceX ?? offsetDistanceSx,
          offsetDistanceDy: offsetDistanceY ?? offsetDistanceSy
        };
  if (focusTop - offsetDistanceDy < focusScrollTop) {
    // 上
    runAnimate({
      scrollEl: currScrollEl,
      scrollType: SCROLLTOP,
      smooth,
      smoothTime,
      end,
      easing,
      from: currScrollEl.scrollTop,
      to: currScrollEl.scrollTop + focusTop - offsetDistanceDy
    });
  }
  if (focusLeft - offsetDistanceDx < focusScrollLeft) {
    // 左
    runAnimate({
      scrollEl: currScrollEl,
      scrollType: SCROLLLEFT,
      smooth,
      smoothTime,
      end,
      easing,
      from: currScrollEl.scrollLeft,
      to: currScrollEl.scrollLeft + focusLeft - focusScrollLeft - offsetDistanceDx
    });
  }
  if (focusRight + offsetDistanceDx > focusScrollRight) {
    // 右
    runAnimate({
      scrollEl: currScrollEl,
      scrollType: SCROLLLEFT,
      smooth,
      smoothTime,
      end,
      easing,
      from: currScrollEl.scrollLeft,
      to: currScrollEl.scrollLeft + focusRight + offsetDistanceDx - focusScrollRight
    });
  }
  if (focusBottom + offsetDistanceDy > focusScrollBottom) {
    // 下
    runAnimate({
      scrollEl: currScrollEl,
      scrollType: SCROLLTOP,
      smooth,
      smoothTime,
      end,
      easing,
      from: currScrollEl.scrollTop,
      to: currScrollEl.scrollTop + (focusBottom + offsetDistanceDy - focusScrollBottom)
    });
  }
};

// 获取当前焦点元素所在块的滚动父元素
export const getScrollEl = () => {
  const currFocusEl = getCurrFocusEl();
  const scrollGroupKey = currFocusEl?.getAttribute(SCROLL_ITEM_KEY);
  const scrollGroup = scrollGroupKey
    ? document.querySelector(`[${SCROLL_GROUP_KEY}="${scrollGroupKey}"]`)
    : null;
  return scrollGroup || HTML || BODY;
};

// 获取全局的限制组元素
export const getRootScrollEl = () => {
  const currFocusEl = getCurrFocusEl();
  const limitGroupKey = currFocusEl?.getAttribute(LIMIT_ITEM_KEY);
  const limitGroup = limitGroupKey
    ? document.querySelector(`[${LIMIT_GROUP_KEY}="${limitGroupKey}"]`)
    : null;
  return limitGroup || HTML || BODY;
};

export const getLastFocusEl = () => lastFocusEl;

export const getLimitGroupEl = () => {
  return limitGroupEls.slice(-1)[0] || HTML || BODY;
};

export const setLimitGroupEl = (arr: Element[]) => {
  limitGroupEls = arr;
};

export const limitGroupElsPush = (el: Element) => {
  return limitGroupEls.push(el);
};

export const limitGroupElsPop = () => {
  return limitGroupEls.pop();
};

export const onLimitChange = (el: HTMLElement, val: boolean) => {
  const currLimitGroupIndex = limitGroupEls.findIndex((item) => item === el);
  if (val === true) {
    if (currLimitGroupIndex < 0) {
      limitGroupElsPush(el);
    }
  } else if (val === false) {
    if (currLimitGroupIndex > -1) {
      const { focusClassName, itemAttrname } = defaultConfig;
      const currFocusEl = el.querySelector(`.${focusClassName}[${itemAttrname}]`);
      if (currFocusEl) {
        const { focusClassName, focusedAttrname } = defaultConfig;
        currFocusEl.classList.remove(focusClassName);
        currFocusEl.removeAttribute(focusedAttrname);
      }
      limitGroupEls.splice(currLimitGroupIndex, 1);
    }
  }
};

export const setAutoFocus = (val = true) => {
  defaultConfig.autoFocus = val === true;
};

export const setDistanceToCenter = (val = true) => {
  defaultConfig.distanceToCenter = val === true;
};

export const setOffsetDistance = (val: number) => {
  defaultConfig.offsetDistanceX = defaultConfig.offsetDistanceY = val;
};

export const setOffsetDistanceX = (val: number) => {
  defaultConfig.offsetDistanceX = val;
};

export const setOffsetDistanceY = (val: number) => {
  defaultConfig.offsetDistanceY = val;
};

const runAnimate = ({ scrollEl, scrollType, smooth, smoothTime, end, easing, from, to }) => {
  const { smoothTime: sSmoothTime } = defaultConfig;
  TWEEN.add(
    new TWEEN.Tween({ [scrollType]: from })
      .to({ [scrollType]: to }, smooth ? smoothTime ?? sSmoothTime : 0)
      .onUpdate((object) => {
        scrollType && (scrollEl[scrollType] = object[scrollType]);
      })
      .easing(getEasing(easing))
      .start()
  );
  updateScroll({ end });
};

const nextInNext = ({ currFocusEl, nextFocusEl, direction }) => {
  currFocusEl === nextFocusEl && lastDirection === direction ? counter++ : (counter = 0);
  const prevCount = directionCount;
  currFocusEl && dispatchCustomEvent(currFocusEl, direction, { count: counter });
  const nextCount = directionCount;
  directionCount = 0;
  directionFlag = prevCount === nextCount;
  return !directionFlag;
};

const dealCount = ({ currFocusEl, nextFocusEl }) => {
  const flag = currFocusEl === nextFocusEl;
  if (flag && !touchEl) {
    currFocusEl &&
      [UP, RIGHT, DOWN, LEFT].forEach((item) => currFocusEl.removeAttribute(`${item}-count`));
    currFocusEl.removeAttribute(`${currDirection}-count`);
    currFocusEl.offsetWidth;
    currFocusEl.setAttribute(`${currDirection}-count`, '');
  }
};

const updateScroll = ({ end }) => {
  if (TWEEN.update()) {
    scrollTimer = requestAnimationFrame(() => updateScroll({ end }));
  } else {
    cancelAnimationFrame(scrollTimer as number);
    scrollTimer = null;
    typeof end === 'function' && end();
  }
};

const dealScrollDirection = ({ currFocusEl, nextFocusEl, direction }) => {
  const scrollDirection = currFocusEl?.getAttribute(SCROLL_DIRECTION_KEY) || '';
  const scrollItem = currFocusEl?.getAttribute(SCROLL_ITEM_KEY) || '';
  const scrollGroup = scrollItem
    ? document.querySelector(`[${SCROLL_GROUP_KEY}="${scrollItem}"]`)
    : null;
  switch (scrollDirection) {
    case 'x': {
      return [LEFT, RIGHT].includes(direction) && !scrollGroup?.contains(nextFocusEl)
        ? currFocusEl
        : null;
    }
    case 'y': {
      return [UP, DOWN].includes(direction) && !scrollGroup?.contains(nextFocusEl)
        ? currFocusEl
        : null;
    }
    default: {
      return null;
    }
  }
};

const getEasing = (val: string | Function) => {
  let tweenEasing = TWEEN.Easing;
  const DEFAULT_EASING = tweenEasing.Quadratic.InOut;
  if (val) {
    const type = getDataType(val);
    switch (type) {
      case 'String': {
        const easing = (val as string).split('.');
        for (let i = 0; i <= easing.length; i++) {
          const item = easing[i];
          if (item in tweenEasing) {
            tweenEasing = tweenEasing[item];
          }
        }
        return tweenEasing;
      }
      case 'Function': {
        return val as any;
      }
      default: {
        return DEFAULT_EASING;
      }
    }
  } else {
    return DEFAULT_EASING;
  }
};
