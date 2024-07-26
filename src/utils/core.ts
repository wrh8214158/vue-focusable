import { touchEl } from './event';
import { animation, scrollStop } from './animation';
import { ArrayIncludes, ArrayFindIndex, ArrayFrom, getScrollingElement } from './polyfill';
import { isDom, calculateHypotenuse, dispatchCustomEvent } from './common';
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
  SCROLLLEFT,
  PARENT_SCROLL_GROUP_KEY,
  LOWCAMEL_ONFOCUS,
  LOWCAMEL_ONBLUR
} from './config';

const scrollingElement = getScrollingElement();
// 上一次落焦的元素
let lastFocusEl: Element | null = null;
// 上一次的方向
let lastDirection = '';
// 当前方向
let currDirection = '';
// 方向计数器
let counter = 0;
// next执行的次数
let directionCount = 0;
// 是否按方向键的标识
let directionFlag = false;
// 限制组元素集合
let limitGroupEls: Element[] = [];

const EMPTY_ARR = [undefined, null];

const DIRECTION_ARR = [UP, RIGHT, DOWN, LEFT];

const INFINITY = Infinity;

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
  const scrollElGroups = ArrayFrom(
    limitGroup.querySelectorAll(
      `[${SCROLL_GROUP_KEY}]:not([${SCROLL_GROUP_KEY}="${scrollItemKey}"])`
    )
  );
  const scrollEls = ArrayFrom(limitGroup.querySelectorAll(`[${itemAttrname}]${scrollItemAttr}`));
  const otherEls = ArrayFrom(
    limitGroup.querySelectorAll(`[${itemAttrname}]:not([${SCROLL_ITEM_KEY}])`)
  );
  return {
    scrollElGroups,
    scrollEls,
    otherEls
  };
};

export const requestFocus = (el: Next) => next(el);

export const next = (el: Next) => {
  const {
    autoFocus,
    endToNext,
    focusClassName,
    focusedAttrname,
    setCountAttr,
    easing: defaultEasing
  } = defaultConfig;
  if (!autoFocus || (endToNext ? !scrollStop : false)) {
    directionCount = 0;
    return;
  }
  directionCount++;
  const currFocusEl = getCurrFocusEl();
  if (ArrayIncludes(DIRECTION_ARR, el as unknown as string)) {
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
    const config = el as NextObject;
    const currEl =
      (config.el as { $el: Element })?.$el ||
      (config.el as { target: Element })?.target ||
      config.el;
    let target: Element | null = null;
    if (ArrayIncludes(DIRECTION_ARR, currEl as unknown as string)) {
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
        !sameTarget &&
          (dispatchCustomEvent(currFocusEl, ONBLUR),
          dispatchCustomEvent(currFocusEl, LOWCAMEL_ONBLUR));
      }
    } else {
      const limitItemKey = target.getAttribute(LIMIT_ITEM_KEY);
      const limitGroup = document.querySelector(`[${LIMIT_GROUP_KEY}="${limitItemKey}"]`);
      if (limitGroup) {
        if (currFocusEl && limitGroup.contains(currFocusEl)) {
          currFocusEl.classList.remove(focusClassName);
          currFocusEl.removeAttribute(focusedAttrname);
          !sameTarget &&
            (dispatchCustomEvent(currFocusEl, ONBLUR),
            dispatchCustomEvent(currFocusEl, LOWCAMEL_ONBLUR));
        }
      }
    }
    target.classList.add(focusClassName);
    target.setAttribute(focusedAttrname, '');
    const { smooth, distanceToCenter, smoothTime, end, offsetDistanceX, offsetDistanceY, easing } =
      config;
    !sameTarget &&
      (dispatchCustomEvent(target, ONFOCUS), dispatchCustomEvent(target, LOWCAMEL_ONFOCUS));
    setCountAttr && dealCount({ currFocusEl, nextFocusEl: target });
    lastFocusEl = target;
    directionFlag = false;
    doAnimate({
      focusEl: target,
      smooth,
      smoothTime,
      end,
      easing: easing || defaultEasing,
      distanceToCenter,
      offsetDistanceX,
      offsetDistanceY
    });
    dealScrollGroupAnimate({
      focusEl: target,
      smooth,
      smoothTime,
      end,
      distanceToCenter,
      offsetDistanceX,
      offsetDistanceY
    });
  }
};

const dealScrollGroupAnimate = ({
  focusEl,
  scrollEl = null,
  smooth,
  smoothTime,
  end,
  distanceToCenter,
  offsetDistanceX,
  offsetDistanceY
}: {
  focusEl: Element | null;
  scrollEl?: Element | null;
  smooth?: boolean;
  smoothTime?: number;
  end?: () => void;
  distanceToCenter?: boolean;
  offsetDistanceX?: number;
  offsetDistanceY?: number;
}) => {
  const scrollItemKey = focusEl?.getAttribute(SCROLL_ITEM_KEY);
  const currFocusEl =
    (scrollItemKey ? document.querySelector(`[${SCROLL_GROUP_KEY}="${scrollItemKey}"]`) : null) ||
    focusEl;
  const parentScrollGroupKey = currFocusEl?.getAttribute(PARENT_SCROLL_GROUP_KEY);
  const currScrollEl =
    (parentScrollGroupKey
      ? document.querySelector(`[${SCROLL_GROUP_KEY}="${parentScrollGroupKey}"]`)
      : null) || scrollEl;
  if (currScrollEl) {
    doAnimate({
      focusEl: currFocusEl,
      scrollEl: currScrollEl,
      smooth,
      smoothTime,
      end,
      distanceToCenter,
      offsetDistanceX,
      offsetDistanceY
    });
    const LimitGroupEl = getLimitGroupEl();
    dealScrollGroupAnimate({
      focusEl: currScrollEl,
      scrollEl: currScrollEl === LimitGroupEl ? null : LimitGroupEl,
      smooth,
      smoothTime,
      end,
      distanceToCenter,
      offsetDistanceX,
      offsetDistanceY
    });
  }
};

export const getNextFocusEl = (direction: DirectionString) => {
  const currFocusEl = getCurrFocusEl();
  const { scrollElGroups, scrollEls, otherEls } = getFocusableEls();
  if (currFocusEl) {
    switch (direction) {
      case LEFT:
      case RIGHT:
      case UP:
      case DOWN: {
        return (
          dealIntersectedEl({ currFocusEl, focusableEls: scrollEls, direction }) ||
          dealIntersectedEl({
            currFocusEl,
            focusableEls: scrollElGroups.concat(otherEls),
            direction
          }) ||
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
  easing?: string | ((val: any) => any);
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
    offsetLeft: focusOffsetLeft = 0,
    offsetTop: focusOffsetTop = 0,
    offsetWidth: focusOffsetWidth = 0,
    offsetHeight: focusOffsetHeight = 0
  } = focusEl as HTMLElement;
  const currScrollEl = (scrollEl || limitGroupEls.slice(-1)[0] || getScrollEl()) as HTMLElement;
  const {
    offsetLeft: scrollOffsetLeft = 0,
    offsetTop: scrollOffsetTop = 0,
    offsetWidth: scrollOffsetWidth = 0,
    offsetHeight: scrollOffsetHeight = 0,
    scrollLeft: currScrollElScrollLeft = 0,
    scrollTop: currScrollElScrollTop = 0,
    scrollHeight: scrollScrollHeight = 0,
    scrollWidth: scrollScrollWidth = 0
  } = currScrollEl;
  const { offsetDistanceDx, offsetDistanceDy } = (
    (ArrayIncludes(EMPTY_ARR, distanceToCenter) ? sDistanceToCenter : distanceToCenter)
      ? {
          offsetDistanceDx: (scrollOffsetWidth - focusOffsetWidth) / 2,
          offsetDistanceDy: (scrollOffsetHeight - focusOffsetHeight) / 2
        }
      : {
          offsetDistanceDx: ArrayIncludes(EMPTY_ARR, offsetDistanceX)
            ? offsetDistanceSx
            : offsetDistanceX,
          offsetDistanceDy: ArrayIncludes(EMPTY_ARR, offsetDistanceY)
            ? offsetDistanceSy
            : offsetDistanceY
        }
  ) as { offsetDistanceDx: number; offsetDistanceDy: number };
  if (
    focusOffsetTop - currScrollElScrollTop - offsetDistanceDy < scrollOffsetTop &&
    currScrollElScrollTop > 0
  ) {
    // 上
    runAnimate({
      scrollEl: currScrollEl,
      scrollType: SCROLLTOP,
      smooth,
      smoothTime,
      end,
      easing,
      from: currScrollElScrollTop,
      to: focusOffsetTop - scrollOffsetTop - offsetDistanceDy
    });
  }
  if (
    focusOffsetLeft - currScrollElScrollLeft - offsetDistanceDx < scrollOffsetLeft &&
    currScrollElScrollLeft > 0
  ) {
    // 左
    runAnimate({
      scrollEl: currScrollEl,
      scrollType: SCROLLLEFT,
      smooth,
      smoothTime,
      end,
      easing,
      from: currScrollElScrollLeft,
      to: focusOffsetLeft - scrollOffsetLeft - offsetDistanceDx
    });
  }
  if (
    focusOffsetLeft - currScrollElScrollLeft + focusOffsetWidth + offsetDistanceDx >
      scrollOffsetLeft + scrollOffsetWidth &&
    currScrollElScrollLeft < scrollScrollWidth - scrollOffsetWidth
  ) {
    // 右
    runAnimate({
      scrollEl: currScrollEl,
      scrollType: SCROLLLEFT,
      smooth,
      smoothTime,
      end,
      easing,
      from: currScrollElScrollLeft,
      to:
        focusOffsetLeft +
        focusOffsetWidth +
        offsetDistanceDx -
        (scrollOffsetLeft + scrollOffsetWidth)
    });
  }
  if (
    focusOffsetTop - currScrollElScrollTop + focusOffsetHeight + offsetDistanceDy >
      scrollOffsetTop + scrollOffsetHeight &&
    currScrollElScrollTop < scrollScrollHeight - scrollOffsetHeight
  ) {
    // 下
    runAnimate({
      scrollEl: currScrollEl,
      scrollType: SCROLLTOP,
      smooth,
      smoothTime,
      end,
      easing,
      from: currScrollElScrollTop,
      to:
        focusOffsetTop +
        focusOffsetHeight +
        offsetDistanceDy -
        (scrollOffsetTop + scrollOffsetHeight)
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
  return scrollGroup || scrollingElement;
};

export const getLastFocusEl = () => lastFocusEl;

export const getLimitGroupEl = () => {
  return (limitGroupEls.slice(-1)[0] || scrollingElement) as HTMLElement;
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
  const currLimitGroupIndex = ArrayFindIndex(limitGroupEls, el);
  if (val) {
    if (currLimitGroupIndex < 0) {
      limitGroupElsPush(el);
    }
  } else {
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

export const setEndToNext = (val: boolean) => {
  defaultConfig.endToNext = val;
};

const dealIntersectedEl = ({ currFocusEl, focusableEls, direction }) => {
  const { itemAttrname } = defaultConfig;
  const {
    top: originTop,
    right: originRight,
    bottom: originBottom,
    left: originLeft
  } = currFocusEl.getBoundingClientRect();
  // 有相交的下一个元素元组
  let intersectedFinalFocusElTuple: [number, Element | null] = [INFINITY, null];
  // 无相交的下一个元素元组
  let notIntersectedFinalFocusElTuple: [number, Element | null] = [INFINITY, null];
  for (let i = 0; i < focusableEls.length; i++) {
    const el = focusableEls[i];
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
    const isIntersected = (() => {
      const leftRight = () =>
        (originTop >= currTop && originTop <= currBottom) ||
        (originBottom >= currTop && originBottom <= currBottom);
      const upDown = () =>
        (originLeft >= currLeft && originLeft <= currRight) ||
        (originRight >= currLeft && originRight <= currRight);
      return {
        left: leftRight,
        right: leftRight,
        up: upDown,
        down: upDown
      }[direction]();
    })();
    if (el !== currFocusEl && currWidth && currHeight && sameSideMap[direction]) {
      const { abs, min } = Math;
      const upDownMinB = () =>
        min(
          abs(originLeft - currLeft),
          abs(originLeft - currRight),
          abs(originRight - currLeft),
          abs(originRight - currRight)
        );
      const leftRightMinB = () =>
        min(
          abs(originTop - currTop),
          abs(originTop - currBottom),
          abs(originBottom - currTop),
          abs(originBottom - currBottom)
        );
      const { a, b } = (() => {
        if (direction === UP) {
          return {
            a: min(abs(originTop - currBottom)),
            b: upDownMinB()
          };
        } else if (direction === RIGHT) {
          return {
            a: min(abs(originRight - currLeft)),
            b: leftRightMinB()
          };
        } else if (direction === DOWN) {
          return {
            a: min(abs(originBottom - currTop)),
            b: upDownMinB()
          };
        } else if (direction === LEFT) {
          return {
            a: min(abs(originLeft - currRight)),
            b: leftRightMinB()
          };
        }
      })() as { a: number; b: number };
      // 斜边长
      const sideLen = calculateHypotenuse(a, b);
      if (isIntersected) {
        // 相交
        if (sideLen < intersectedFinalFocusElTuple[0]) {
          const isAvailableScrollGroup =
            el.hasAttribute(SCROLL_GROUP_KEY) && !el.hasAttribute(itemAttrname)
              ? el.querySelector(`[${itemAttrname}]`)
              : false;
          intersectedFinalFocusElTuple = isAvailableScrollGroup
            ? dealScrollGroupFocusElTuple({
                sideLen,
                el,
                currFocusEl,
                direction,
                originTop,
                originLeft,
                originRight,
                originBottom
              })
            : [sideLen, el];
        }
      } else {
        if (intersectedFinalFocusElTuple[0] === INFINITY) {
          // 如果相交里有值，则不再计算不相交的值
          if (sideLen < notIntersectedFinalFocusElTuple[0]) {
            if (!el.hasAttribute(SCROLL_GROUP_KEY)) {
              notIntersectedFinalFocusElTuple = [sideLen, el];
            }
          }
        }
      }
    }
  }
  const scrollDirection = currFocusEl.getAttribute(SCROLL_DIRECTION_KEY) || '';
  const limitDirection = {
    x: [LEFT, RIGHT],
    y: [UP, DOWN]
  };
  return (
    (ArrayIncludes(limitDirection[scrollDirection] || [], direction)
      ? intersectedFinalFocusElTuple[1]
      : intersectedFinalFocusElTuple[1] || notIntersectedFinalFocusElTuple[1]) || null
  );
};

const runAnimate = ({ scrollEl, scrollType, smooth, smoothTime, end, easing, from, to }) => {
  const { smoothTime: sSmoothTime } = defaultConfig;
  animation({
    from,
    to,
    easing,
    duration: smooth ? (ArrayIncludes(EMPTY_ARR, smoothTime) ? sSmoothTime : smoothTime) : 0,
    type: scrollType,
    update: (obj) => {
      if (scrollType in scrollEl) {
        scrollEl[scrollType] = obj[scrollType];
        obj.end && typeof end === 'function' && end();
      }
    }
  });
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
    for (let i = 0; i < DIRECTION_ARR.length; i++) {
      const item = DIRECTION_ARR[i];
      currFocusEl.removeAttribute(`${item}-count`);
    }
    currFocusEl.removeAttribute(`${currDirection}-count`);
    currFocusEl.offsetWidth;
    currFocusEl.setAttribute(`${currDirection}-count`, '');
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
      return ArrayIncludes([LEFT, RIGHT], direction) && !scrollGroup?.contains(nextFocusEl)
        ? currFocusEl
        : null;
    }
    case 'y': {
      return ArrayIncludes([UP, DOWN], direction) && !scrollGroup?.contains(nextFocusEl)
        ? currFocusEl
        : null;
    }
    default: {
      return null;
    }
  }
};

const dealScrollGroupFocusElTuple = ({
  sideLen,
  el,
  currFocusEl,
  direction,
  originTop,
  originLeft,
  originRight,
  originBottom
}: {
  sideLen: number;
  el: HTMLElement;
  currFocusEl: HTMLElement;
  direction: string;
  originTop: number;
  originLeft: number;
  originRight: number;
  originBottom: number;
}) => {
  const scrollGroupElChildren = ArrayFrom(el.querySelectorAll(`[${defaultConfig.itemAttrname}]`));
  const closestEl = [[RIGHT, DOWN].includes(direction) ? INFINITY : -INFINITY, []] as [
    number,
    HTMLElement[]
  ];
  for (let i = 0; i < scrollGroupElChildren.length; i++) {
    const item = scrollGroupElChildren[i];
    const { top, bottom, left, right } = item.getBoundingClientRect();
    switch (direction) {
      case UP: {
        if (originTop >= bottom) {
          if (bottom >= closestEl[0]) {
            const sameVal = bottom === closestEl[0];
            closestEl[0] = bottom;
            sameVal ? closestEl[1].push(item) : (closestEl[1] = [item]);
          }
        }
        break;
      }
      case RIGHT: {
        if (originRight <= left) {
          if (left <= closestEl[0]) {
            const sameVal = left === closestEl[0];
            closestEl[0] = left;
            sameVal ? closestEl[1].push(item) : (closestEl[1] = [item]);
          }
        }
        break;
      }
      case DOWN: {
        if (originBottom <= top) {
          if (top <= closestEl[0]) {
            const sameVal = top === closestEl[0];
            closestEl[0] = top;
            sameVal ? closestEl[1].push(item) : (closestEl[1] = [item]);
          }
        }
        break;
      }
      case LEFT: {
        if (originLeft >= right) {
          if (right >= closestEl[0]) {
            const sameVal = right === closestEl[0];
            closestEl[0] = right;
            sameVal ? closestEl[1].push(item) : (closestEl[1] = [item]);
          }
        }
        break;
      }
      default: {
        break;
      }
    }
  }
  return [sideLen, dealIntersectedEl({ currFocusEl, focusableEls: closestEl[1], direction })] as [
    number,
    HTMLElement | null
  ];
};
