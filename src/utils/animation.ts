import { requestAnimationFrame, cancelAnimationFrame } from './event';

/*
 * Tween.js
 * t: current time（当前时间）；
 * b: beginning value（初始值）；
 * c: change in value（变化量）；
 * d: duration（持续时间）。
 * you can visit 'https://www.zhangxinxu.com/study/201612/how-to-use-tween-js.html' to get effect
 */
export const Tween = {
  Linear: function (t, b, c, d) {
    return (c * t) / d + b;
  },
  Quad: {
    easeIn: function (t, b, c, d) {
      return c * (t /= d) * t + b;
    },
    easeOut: function (t, b, c, d) {
      return -c * (t /= d) * (t - 2) + b;
    },
    easeInOut: function (t, b, c, d) {
      if ((t /= d / 2) < 1) return (c / 2) * t * t + b;
      return (-c / 2) * (--t * (t - 2) - 1) + b;
    }
  },
  Cubic: {
    easeIn: function (t, b, c, d) {
      return c * (t /= d) * t * t + b;
    },
    easeOut: function (t, b, c, d) {
      return c * ((t = t / d - 1) * t * t + 1) + b;
    },
    easeInOut: function (t, b, c, d) {
      if ((t /= d / 2) < 1) return (c / 2) * t * t * t + b;
      return (c / 2) * ((t -= 2) * t * t + 2) + b;
    }
  },
  Quart: {
    easeIn: function (t, b, c, d) {
      return c * (t /= d) * t * t * t + b;
    },
    easeOut: function (t, b, c, d) {
      return -c * ((t = t / d - 1) * t * t * t - 1) + b;
    },
    easeInOut: function (t, b, c, d) {
      if ((t /= d / 2) < 1) return (c / 2) * t * t * t * t + b;
      return (-c / 2) * ((t -= 2) * t * t * t - 2) + b;
    }
  },
  Quint: {
    easeIn: function (t, b, c, d) {
      return c * (t /= d) * t * t * t * t + b;
    },
    easeOut: function (t, b, c, d) {
      return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
    },
    easeInOut: function (t, b, c, d) {
      if ((t /= d / 2) < 1) return (c / 2) * t * t * t * t * t + b;
      return (c / 2) * ((t -= 2) * t * t * t * t + 2) + b;
    }
  },
  Sine: {
    easeIn: function (t, b, c, d) {
      return -c * Math.cos((t / d) * (Math.PI / 2)) + c + b;
    },
    easeOut: function (t, b, c, d) {
      return c * Math.sin((t / d) * (Math.PI / 2)) + b;
    },
    easeInOut: function (t, b, c, d) {
      return (-c / 2) * (Math.cos((Math.PI * t) / d) - 1) + b;
    }
  },
  Expo: {
    easeIn: function (t, b, c, d) {
      return t == 0 ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
    },
    easeOut: function (t, b, c, d) {
      return t == d ? b + c : c * (-Math.pow(2, (-10 * t) / d) + 1) + b;
    },
    easeInOut: function (t, b, c, d) {
      if (t == 0) return b;
      if (t == d) return b + c;
      if ((t /= d / 2) < 1) return (c / 2) * Math.pow(2, 10 * (t - 1)) + b;
      return (c / 2) * (-Math.pow(2, -10 * --t) + 2) + b;
    }
  },
  Circ: {
    easeIn: function (t, b, c, d) {
      return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
    },
    easeOut: function (t, b, c, d) {
      return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
    },
    easeInOut: function (t, b, c, d) {
      if ((t /= d / 2) < 1) return (-c / 2) * (Math.sqrt(1 - t * t) - 1) + b;
      return (c / 2) * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
    }
  },
  Elastic: {
    easeIn: function (t, b, c, d, a, p) {
      let s;
      if (t == 0) return b;
      if ((t /= d) == 1) return b + c;
      if (typeof p == 'undefined') p = d * 0.3;
      if (!a || a < Math.abs(c)) {
        s = p / 4;
        a = c;
      } else {
        s = (p / (2 * Math.PI)) * Math.asin(c / a);
      }
      return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin(((t * d - s) * (2 * Math.PI)) / p)) + b;
    },
    easeOut: function (t, b, c, d, a, p) {
      let s;
      if (t == 0) return b;
      if ((t /= d) == 1) return b + c;
      if (typeof p == 'undefined') p = d * 0.3;
      if (!a || a < Math.abs(c)) {
        a = c;
        s = p / 4;
      } else {
        s = (p / (2 * Math.PI)) * Math.asin(c / a);
      }
      return a * Math.pow(2, -10 * t) * Math.sin(((t * d - s) * (2 * Math.PI)) / p) + c + b;
    },
    easeInOut: function (t, b, c, d, a, p) {
      let s;
      if (t == 0) return b;
      if ((t /= d / 2) == 2) return b + c;
      if (typeof p == 'undefined') p = d * (0.3 * 1.5);
      if (!a || a < Math.abs(c)) {
        a = c;
        s = p / 4;
      } else {
        s = (p / (2 * Math.PI)) * Math.asin(c / a);
      }
      if (t < 1)
        return (
          -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin(((t * d - s) * (2 * Math.PI)) / p)) + b
        );
      return (
        a * Math.pow(2, -10 * (t -= 1)) * Math.sin(((t * d - s) * (2 * Math.PI)) / p) * 0.5 + c + b
      );
    }
  },
  Back: {
    easeIn: function (t, b, c, d, s) {
      if (typeof s == 'undefined') s = 1.70158;
      return c * (t /= d) * t * ((s + 1) * t - s) + b;
    },
    easeOut: function (t, b, c, d, s) {
      if (typeof s == 'undefined') s = 1.70158;
      return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
    },
    easeInOut: function (t, b, c, d, s) {
      if (typeof s == 'undefined') s = 1.70158;
      if ((t /= d / 2) < 1) return (c / 2) * (t * t * (((s *= 1.525) + 1) * t - s)) + b;
      return (c / 2) * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b;
    }
  },
  Bounce: {
    easeIn: function (t, b, c, d) {
      return c - Tween.Bounce.easeOut(d - t, 0, c, d) + b;
    },
    easeOut: function (t, b, c, d) {
      if ((t /= d) < 1 / 2.75) {
        return c * (7.5625 * t * t) + b;
      } else if (t < 2 / 2.75) {
        return c * (7.5625 * (t -= 1.5 / 2.75) * t + 0.75) + b;
      } else if (t < 2.5 / 2.75) {
        return c * (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375) + b;
      } else {
        return c * (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375) + b;
      }
    },
    easeInOut: function (t, b, c, d) {
      if (t < d / 2) {
        return Tween.Bounce.easeIn(t * 2, 0, c, d) * 0.5 + b;
      } else {
        return Tween.Bounce.easeOut(t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
      }
    }
  }
};

export let scrollStop = true;

/**
 * @description 对运动方法进行封装，让Tween.js缓动算法更容易理解和使用
 */
export const animation = ({ from, to, duration, easing = 'Quart.easeOut', type, update, fps }) => {
  const easingFunc = getEasing(easing);
  let start = Date.now();
  let after = start;
  let timer: any = null;
  const fpsLimit = fps && typeof fps === 'number';
  const step = () => {
    if (duration) {
      const now = Date.now();
      const progress = now - start;
      if (progress < duration) {
        timer = requestAnimationFrame(step);
        scrollStop = false;
        if (fpsLimit) {
          const fpsInterval = 1000 / fps;
          const delta = now - after;
          if (delta > fpsInterval) {
            after = now - (delta % fpsInterval);
            update({
              end: false,
              [type]: easingFunc(progress, from, to - from, duration)
            });
          }
        } else {
          update({
            end: false,
            [type]: easingFunc(progress, from, to - from, duration)
          });
        }
      } else {
        clearAnimationTimer(timer);
        scrollStop = true;
        update({
          end: true,
          [type]: easingFunc(duration, from, to - from, duration)
        });
      }
    } else {
      update({
        end: true,
        [type]: to
      });
    }
  };
  step();
  return {
    cancel: () => clearAnimationTimer(timer)
  };
};

const getEasing = (easing = ''): any => {
  if (typeof easing === 'string') {
    const easingArr = easing.split('.');
    let func = Tween;
    for (let i = 0; i < easingArr.length; i++) {
      const item = easingArr[i];
      if (func[item]) {
        func = func[item];
      } else {
        func = Tween;
        break;
      }
    }
    return func === Tween ? Tween.Quart.easeOut : func;
  } else if (typeof easing === 'function') {
    return easing as (val?: any) => any;
  } else {
    console.error('Illegal value');
    return Tween.Quart.easeOut;
  }
};

const clearAnimationTimer = (timer) => {
  cancelAnimationFrame(timer);
  timer = null;
};
