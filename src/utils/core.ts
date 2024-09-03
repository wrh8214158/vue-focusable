import { animation, scrollStop } from './animation';
import { ArrayIncludes, ArrayFindIndex, ArrayFrom, getScrollingElement } from './polyfill';
import { isDom, calculateHypotenuse, dispatchCustomEvent } from './common';
import type { Next, DirectionString, NextObject } from '../types/core.d';
import {
  SCROLL_GROUP_KEY,
  SCROLL_DIRECTION_KEY,
  SCROLL_ITEM_KEY,
  SCROLL_RECORD_KEY,
  SCROLL_OUT,
  SCROLL_IN,
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
  LOWCAMEL_ONBLUR,
  ROOT_SCROLL_KEY,
  FOCUS_FIRST_KEY,
  SCROLL_LEFT_HIDDEN_KEY,
  SCROLL_TOP_HIDDEN_KEY,
  SCROLL_RIGHT_HIDDEN_KEY,
  SCROLL_BOTTOM_HIDDEN_KEY,
  SCROLL_FIND_FOCUS_TYPE_KEY
} from './config';
import { cancelAnimationFrame, requestAnimationFrame } from './event';

export const scrollingElement = getScrollingElement();
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
// 限制组元素集合
let limitGroupEls: Element[] = [];

const EMPTY_ARR = [undefined, null];

const DIRECTION_ARR = [UP, RIGHT, DOWN, LEFT];

const INFINITY = Infinity;
// 滚动组历史记录
export const SCROLL_GROUP_RECORD: { [key: string]: { lastFocus: Element | null } } = {};

let scrollTimer: number | null = null;

export const getCurrFocusEl = () => {
  const { focusClassName, itemAttrname } = defaultConfig;
  const limitGroup = getLimitGroupEl();
  return limitGroup.querySelector(`.${focusClassName}[${itemAttrname}]`);
};

export const getFocusableEls = () => {
  const { itemAttrname } = defaultConfig;
  const limitGroup = getLimitGroupEl();
  const currFocusEl = currFocusElInfo.el || getCurrFocusEl();
  const scrollItemKey = currFocusEl?.getAttribute(SCROLL_ITEM_KEY);
  const _scrollElGroups = limitGroup.querySelectorAll(
    `[${SCROLL_GROUP_KEY}]:not([${SCROLL_GROUP_KEY}="${scrollItemKey}"])`
  );
  const scrollElGroups: HTMLElement[] = [];
  for (let i = 0; i < _scrollElGroups.length; i++) {
    const scrollElGroupItem = _scrollElGroups[i] as HTMLElement;
    if (scrollElGroupItem.querySelector(`[${itemAttrname}]`)) {
      scrollElGroups.push(scrollElGroupItem);
    }
  }
  const scrollEls = limitGroup.querySelectorAll(
    `[${itemAttrname}][${SCROLL_ITEM_KEY}="${scrollItemKey}"]`
  );
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

const currFocusElInfo: { el: Element | null; clientRect: DOMRect | undefined } = {
  el: null,
  clientRect: undefined
};

export const next = (el: Next) => {
  const { autoFocus, endToNext, focusClassName, focusedAttrname } = defaultConfig;
  if (!autoFocus || (endToNext ? !scrollStop : false)) {
    directionCount = 0;
    return;
  }
  directionCount++;
  const currFocusEl = currFocusElInfo.el || getCurrFocusEl();
  currFocusElInfo.el = currFocusEl;
  currFocusElInfo.clientRect = currFocusElInfo.clientRect || currFocusEl?.getBoundingClientRect();
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
    const blurFunc = () => {
      if (currFocusEl && target !== lastFocusEl) {
        currFocusEl.classList.remove(focusClassName);
        currFocusEl.removeAttribute(focusedAttrname);
        !sameTarget &&
          (dispatchCustomEvent(currFocusEl, ONBLUR),
          dispatchCustomEvent(currFocusEl, LOWCAMEL_ONBLUR));
      }
    };
    if (!target.hasAttribute(LIMIT_ITEM_KEY)) {
      blurFunc();
    } else {
      const limitItemKey = target.getAttribute(LIMIT_ITEM_KEY);
      const limitGroup = document.querySelector(`[${LIMIT_GROUP_KEY}="${limitItemKey}"]`);
      if (limitGroup) {
        if (limitGroup.contains(currFocusEl)) {
          blurFunc();
        }
      }
    }
    target.classList.add(focusClassName);
    target.setAttribute(focusedAttrname, '');
    !sameTarget &&
      (dispatchCustomEvent(target, ONFOCUS), dispatchCustomEvent(target, LOWCAMEL_ONFOCUS));
    const { scrollItemKey, scrollGroup } = getScrollGroup(target);
    if (scrollItemKey && scrollGroup?.hasAttribute(SCROLL_RECORD_KEY)) {
      SCROLL_GROUP_RECORD[scrollItemKey] = { lastFocus: target };
    }
    const { scrollItemKey: lastScrollItemKey, scrollGroup: lastScrollGroup } =
      getScrollGroup(lastFocusEl);
    const scrollKeyNotSame = scrollItemKey !== lastScrollItemKey;
    const directionData =
      (lastScrollGroup || scrollGroup) && scrollKeyNotSame && dealDirection(target, lastFocusEl);
    if (lastScrollGroup && scrollKeyNotSame) {
      // 上一个落焦元素是滚动组元素，并且当前落焦元素的 SCROLL_ITEM_KEY 与上一个元素不等，触发滚动组的 scroll-out 事件
      dispatchCustomEvent(lastScrollGroup, SCROLL_OUT, directionData);
    }
    if (scrollGroup && scrollKeyNotSame) {
      // 当前落焦元素是滚动组元素，并且上一个落焦元素的 SCROLL_ITEM_KEY 与当前元素不等，触发滚动组的 scroll-in 事件
      dispatchCustomEvent(scrollGroup, SCROLL_IN, directionData);
    }
    clearScrollTimer();
    const doScroll = () => {
      const {
        smooth,
        distanceToCenter,
        smoothTime,
        end,
        offsetDistanceX,
        offsetDistanceY,
        easing
      } = config;
      doAnimate({
        focusEl: target,
        scrollEl: scrollGroup,
        smooth,
        smoothTime,
        end,
        easing,
        distanceToCenter,
        offsetDistanceX,
        offsetDistanceY
      });
      if (scrollGroup || limitGroupEls.slice(-1)[0]) {
        dealScrollGroupAnimate({
          focusEl: target,
          smooth,
          smoothTime,
          end,
          easing,
          distanceToCenter,
          offsetDistanceX,
          offsetDistanceY
        });
      }
      clearScrollTimer();
      currFocusElInfo.el = null;
      currFocusElInfo.clientRect = undefined;
    };
    scrollTimer = requestAnimationFrame(doScroll);
    lastFocusEl = target;
  }
};

export const getNextFocusEl = (direction: DirectionString) => {
  const currFocusEl = currFocusElInfo.el || getCurrFocusEl();
  if (currFocusEl) {
    switch (direction) {
      case LEFT:
      case RIGHT:
      case UP:
      case DOWN: {
        const { scrollElGroups, scrollEls, otherEls } = getFocusableEls();
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
    const LimitGroupEl = getLimitGroupEl();
    return (LimitGroupEl.querySelector(`[${defaultConfig.itemAttrname}]`) as Element) || null;
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
    left: focusElLeft = 0,
    top: focusElTop = 0,
    width: focusElWidth = 0,
    height: focusElHeight = 0
  } = (currFocusElInfo.el === focusEl ? currFocusElInfo.clientRect : null) ||
  (focusEl as HTMLElement).getBoundingClientRect();
  const currScrollEl = (scrollEl || limitGroupEls.slice(-1)[0] || getScrollEl()) as HTMLElement;
  const {
    scrollLeft: currScrollElScrollLeft = 0,
    scrollTop: currScrollElScrollTop = 0,
    scrollWidth: currScrollElScrollWidth = 0,
    scrollHeight: currScrollElScrollHeight = 0
  } = currScrollEl;
  const {
    left: currScrollElLeft = 0,
    top: currScrollElTop = 0,
    width: currScrollElWidth = 0,
    height: currScrollElHeight = 0
  } = currScrollEl.getBoundingClientRect();
  const { offsetDistanceDx, offsetDistanceDy } = (
    (ArrayIncludes(EMPTY_ARR, distanceToCenter) ? sDistanceToCenter : distanceToCenter)
      ? {
          offsetDistanceDx: (currScrollElWidth - focusElWidth) / 2,
          offsetDistanceDy: (currScrollElHeight - focusElHeight) / 2
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
  if (focusElTop - currScrollElTop - currScrollElScrollTop < offsetDistanceDy) {
    // 上
    if (currScrollElScrollTop) {
      runAnimate({
        scrollEl: currScrollEl,
        scrollType: SCROLLTOP,
        smooth,
        smoothTime,
        end,
        easing,
        from: currScrollElScrollTop,
        to: focusElTop - offsetDistanceDy + currScrollElScrollTop
      });
    }
  } else if (focusElTop - currScrollElTop - currScrollElScrollTop > offsetDistanceDy) {
    // 下
    if (currScrollElScrollTop + currScrollElHeight < currScrollElScrollHeight) {
      runAnimate({
        scrollEl: currScrollEl,
        scrollType: SCROLLTOP,
        smooth,
        smoothTime,
        end,
        easing,
        from: currScrollElScrollTop,
        to: focusElTop - offsetDistanceDy + currScrollElScrollTop
      });
    }
  }
  if (focusElLeft - currScrollElLeft - currScrollElScrollLeft < offsetDistanceDx) {
    // 左
    if (currScrollElScrollLeft) {
      runAnimate({
        scrollEl: currScrollEl,
        scrollType: SCROLLLEFT,
        smooth,
        smoothTime,
        end,
        easing,
        from: currScrollElScrollLeft,
        to: focusElLeft - offsetDistanceDx + currScrollElScrollLeft
      });
    }
  } else if (focusElLeft - currScrollElLeft - currScrollElScrollLeft > offsetDistanceDx) {
    // 右
    if (currScrollElScrollLeft + currScrollElWidth < currScrollElScrollWidth) {
      runAnimate({
        scrollEl: currScrollEl,
        scrollType: SCROLLLEFT,
        smooth,
        smoothTime,
        end,
        easing,
        from: currScrollElScrollLeft,
        to: focusElLeft - offsetDistanceDx + currScrollElScrollLeft
      });
    }
  }
};

// 获取当前焦点元素所在块的滚动父元素
export const getScrollEl = () => {
  const currFocusEl = currFocusElInfo.el || getCurrFocusEl();
  const { scrollGroup } = getScrollGroup(currFocusEl);
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

export const updateScrollGroupRecord = ({ key, el }) => {
  if (key in SCROLL_GROUP_RECORD) {
    SCROLL_GROUP_RECORD[key] = { lastFocus: el };
  }
};

export const setHiddenAttr = (el: HTMLElement) => {
  const { scrollLeft, scrollTop, scrollWidth, scrollHeight, clientWidth, clientHeight } = el;
  scrollLeft
    ? el.setAttribute(SCROLL_LEFT_HIDDEN_KEY, '')
    : el.removeAttribute(SCROLL_LEFT_HIDDEN_KEY);
  scrollTop
    ? el.setAttribute(SCROLL_TOP_HIDDEN_KEY, '')
    : el.removeAttribute(SCROLL_TOP_HIDDEN_KEY);
  clientWidth + scrollLeft < scrollWidth
    ? el.setAttribute(SCROLL_RIGHT_HIDDEN_KEY, '')
    : el.removeAttribute(SCROLL_RIGHT_HIDDEN_KEY);
  clientHeight + scrollTop < scrollHeight
    ? el.setAttribute(SCROLL_BOTTOM_HIDDEN_KEY, '')
    : el.removeAttribute(SCROLL_BOTTOM_HIDDEN_KEY);
};

export const setAutoFocus = (val = true) => {
  defaultConfig.autoFocus = val === true;
};

export const setDistanceToCenter = (val = true) => {
  defaultConfig.distanceToCenter = val === true;
};

export const setOffsetDistance = (val: number = 50) => {
  defaultConfig.offsetDistanceX = defaultConfig.offsetDistanceY = val;
};

export const setOffsetDistanceX = (val: number = 50) => {
  defaultConfig.offsetDistanceX = val;
};

export const setOffsetDistanceY = (val: number = 50) => {
  defaultConfig.offsetDistanceY = val;
};

export const setEndToNext = (val: boolean = false) => {
  defaultConfig.endToNext = val;
};

export const setSmoothTime = (val: number = 800) => {
  defaultConfig.smoothTime = val;
};

export const setScrollDelay = (val: number = 0) => {
  defaultConfig.scrollDelay = val;
};

export const getDefaultConfig = (key: string) => {
  return defaultConfig[key];
};

const clearScrollTimer = () => {
  cancelAnimationFrame(scrollTimer as number);
  scrollTimer = null;
};

const dealDirection = (target, lastFocusEl) => {
  if (!lastFocusEl || !target) {
    return {};
  } else {
    const {
      top: targetTop,
      left: targetLeft,
      bottom: targetBottom,
      right: targetRight
    } = currFocusElInfo.clientRect || target.getBoundingClientRect();
    const {
      top: lastTop,
      left: lastLeft,
      bottom: lastBottom,
      right: lastRight
    } = lastFocusEl.getBoundingClientRect();
    let directionArr: string[] = [];
    if (targetTop < lastTop) {
      directionArr.push(UP);
    } else if (targetBottom > lastBottom) {
      directionArr.push(DOWN);
    }
    if (targetLeft < lastLeft) {
      directionArr.push(LEFT);
    } else if (targetRight > lastRight) {
      directionArr.push(RIGHT);
    }
    return {
      directionArr
    };
  }
};

const getScrollGroup = (el) => {
  const scrollItemKey = el?.getAttribute(SCROLL_ITEM_KEY) || '';
  return {
    scrollItemKey,
    scrollGroup: scrollItemKey
      ? document.querySelector(`[${SCROLL_GROUP_KEY}="${scrollItemKey}"]`)
      : null
  };
};

const dealScrollGroupAnimate = ({
  focusEl,
  scrollEl = null,
  smooth,
  smoothTime,
  end,
  easing,
  distanceToCenter,
  offsetDistanceX,
  offsetDistanceY
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
  const { scrollGroup } = getScrollGroup(focusEl);
  const currFocusEl = scrollGroup || focusEl;
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
      easing,
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
      easing,
      distanceToCenter,
      offsetDistanceX,
      offsetDistanceY
    });
  } else {
    if (currFocusEl?.getAttribute(ROOT_SCROLL_KEY) !== 'false') {
      doAnimate({
        focusEl: currFocusEl,
        scrollEl: scrollingElement,
        smooth,
        smoothTime,
        end,
        easing,
        distanceToCenter,
        offsetDistanceX,
        offsetDistanceY
      });
    }
  }
};

const dealIntersectedEl = ({ currFocusEl, focusableEls, direction }) => {
  const { itemAttrname } = defaultConfig;
  const {
    top: originTop,
    right: originRight,
    bottom: originBottom,
    left: originLeft
  } = currFocusElInfo.clientRect || currFocusEl.getBoundingClientRect();
  // 有相交的下一个元素元组
  let intersectedFinalFocusElTuple: [number, Element | null] = [INFINITY, null];
  // 无相交的下一个元素元组
  let notIntersectedFinalFocusElTuple: [number, Element | null] = [INFINITY, null];
  for (let i = 0; i < focusableEls.length; i++) {
    const el = focusableEls[i];
    if (el !== currFocusEl) {
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
          (originBottom >= currTop && originBottom <= currBottom) ||
          (originTop <= currTop && originBottom >= currBottom);
        const upDown = () =>
          (originLeft >= currLeft && originLeft <= currRight) ||
          (originRight >= currLeft && originRight <= currRight) ||
          (originLeft <= currLeft && originRight >= currRight);
        return {
          left: leftRight,
          right: leftRight,
          up: upDown,
          down: upDown
        }[direction]();
      })();
      if (currWidth && currHeight && sameSideMap[direction]) {
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
          switch (direction) {
            case UP:
              return {
                a: abs(originTop - currBottom),
                b: upDownMinB()
              };
            case RIGHT:
              return {
                a: abs(originRight - currLeft),
                b: leftRightMinB()
              };
            case DOWN:
              return {
                a: abs(originBottom - currTop),
                b: upDownMinB()
              };
            case LEFT:
              return {
                a: abs(originLeft - currRight),
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
              el.hasAttribute(SCROLL_GROUP_KEY) && !el.hasAttribute(itemAttrname);
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
  }
  const scrollDirection = currFocusEl.getAttribute(SCROLL_DIRECTION_KEY) || '';
  const limitDirection = {
    x: [LEFT, RIGHT],
    y: [UP, DOWN]
  };
  const { scrollGroup } = getScrollGroup(currFocusEl);
  const scrollFindFocusTypeIntersected =
    scrollGroup?.getAttribute(SCROLL_FIND_FOCUS_TYPE_KEY) === '0';
  const intersectedEl = intersectedFinalFocusElTuple[1];
  const notIntersectedEl = notIntersectedFinalFocusElTuple[1];
  return (
    (ArrayIncludes(limitDirection[scrollDirection] || [], direction)
      ? intersectedEl
      : scrollFindFocusTypeIntersected
        ? intersectedEl
        : intersectedEl || notIntersectedEl) || null
  );
};

const animationObj = {};

const runAnimate = ({ scrollEl, scrollType, smooth, smoothTime, end, easing, from, to }) => {
  const { smoothTime: sSmoothTime, fps } = defaultConfig;
  const animationScrollEl = animationObj[scrollEl];
  if (animationScrollEl) {
    if (animationScrollEl[scrollType]) {
      // 清除动画
      animationScrollEl[scrollType]();
    }
    animationScrollEl[scrollType] = null;
  } else {
    animationObj[scrollEl] = {
      [scrollType]: null
    };
  }
  const isEndFunc = typeof end === 'function';
  const { cancel } = animation({
    from,
    to,
    easing,
    duration: smooth ? (ArrayIncludes(EMPTY_ARR, smoothTime) ? sSmoothTime : smoothTime) : 0,
    type: scrollType,
    fps,
    update: (obj) => {
      scrollEl[scrollType] = obj[scrollType];
      if (obj.end) {
        if (animationScrollEl) {
          delete animationScrollEl[scrollType];
          !Object.keys(animationScrollEl).length && delete animationObj[scrollEl];
        }
        isEndFunc && end();
      }
    }
  });
  animationObj[scrollEl] && (animationObj[scrollEl][scrollType] = cancel);
};

const nextInNext = ({ currFocusEl, nextFocusEl, direction }) => {
  if (currFocusEl === nextFocusEl) {
    lastDirection === direction ? counter++ : (counter = 1);
  } else {
    counter = 0;
  }
  const prevCount = directionCount;
  currFocusEl && dispatchCustomEvent(currFocusEl, direction, { count: counter });
  const nextCount = directionCount;
  directionCount = 0;
  return prevCount !== nextCount;
};

const dealScrollDirection = ({ currFocusEl, nextFocusEl, direction }) => {
  const scrollDirection = currFocusEl?.getAttribute(SCROLL_DIRECTION_KEY) || '';
  const { scrollGroup } = getScrollGroup(currFocusEl);
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
  const nextScrollGroupVal = el.getAttribute(SCROLL_GROUP_KEY);
  const nextScrollGroup = nextScrollGroupVal
    ? document.querySelector(`[${SCROLL_GROUP_KEY}="${nextScrollGroupVal}"]`)
    : null;
  if (nextScrollGroup && nextScrollGroup.hasAttribute(SCROLL_RECORD_KEY)) {
    const lastFocus = SCROLL_GROUP_RECORD[nextScrollGroupVal as string]?.lastFocus;
    if (lastFocus) {
      return [sideLen, lastFocus] as [number, HTMLElement];
    } else {
      if (el.hasAttribute(FOCUS_FIRST_KEY)) {
        const firstFocusEls = el.querySelectorAll(`[${defaultConfig.itemAttrname}]`);
        for (let i = 0; i < firstFocusEls.length; i++) {
          const item = firstFocusEls[i];
          const { clientWidth, clientHeight } = item;
          if (clientWidth && clientHeight) {
            return [sideLen, item] as [number, HTMLElement];
          }
        }
      }
    }
  }
  const scrollGroupElChildren = el.querySelectorAll(`[${defaultConfig.itemAttrname}]`);
  const closestEl = [ArrayIncludes([RIGHT, DOWN], direction) ? INFINITY : -INFINITY, []] as [
    number,
    HTMLElement[]
  ];
  for (let i = 0; i < scrollGroupElChildren.length; i++) {
    const item = scrollGroupElChildren[i] as HTMLElement;
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
