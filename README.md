# vue-focusable

[![NPM Version][npm-image]][npm-url] [![NPM License][npm-licence]][licence-url] [![NPM Unpacked Size][npm-size]][size-url]

> An auto-focusable lib for Vue, 0 Dependencies, Support Vue 2.x and Vue 3.x

<div align="center">
  <a href="https://github.com/wrh8214158/vue-focusable">
   <img width="180" height="180" src="https://img-sky-fs.skysrt.com/lottery_images/img/20240726/20240726112638377809.png" alt="logo" />
  </a>
</div>
<div align="center">
  <sup>The open-source Focus Management Library</sup>
</div>

## Install

Using npm:

```sh
npm i vue-focusable
```

Using yarn:

```sh
yarn add vue-focusable
```

Using pnpm:

```sh
pnpm add vue-focusable
```

## Usage

`main.ts`

```js
// 此方法为全量导入
import { createApp } from 'vue';
import App from './App.vue';
import VueFocusable from 'vue-focusable';

const APP = createApp(App);

APP.use(
  VueFocusable({
    /** options */
  })
).mount('#app');
```

或者

```js
// 也可选择按需引入
import { createApp } from 'vue';
import App from './App.vue';
import { focusable, scrollGroup, limitGroup } from 'vue-focusable';

const APP = createApp(App);

APP.directive(
  focusable({
    /** options */
  })
);
APP.directive(scrollGroup());
APP.directive(limitGroup());

APP.mount('#app');
```

也可以直接引用 js 文件

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="renderer" content="webkit" />
    <meta name="force-rendering" content="webkit" />
    <meta
      name="viewport"
      content="width=device-width,initial-scale=1.0,minimum-scale=1,maximum-scale=1,user-scalable=no"
    />
    <title>VueFocusable Example</title>
    <style type="text/css">
      * {
        margin: 0;
        padding: 0;
      }
      #app {
        width: 1920px;
        height: 1080px;
      }
      #app .wrapper .item {
        display: inline-block;
        width: 100px;
        height: 100px;
        line-height: 100px;
        background-color: green;
        margin: 10px;
        text-align: center;
        border-radius: 10px;
        color: #fff;
        font-size: 30px;
        font-weight: 500;
      }
      #app .wrapper .item.focus {
        background-color: red;
      }
    </style>
  </head>

  <body>
    <div id="app">
      <div class="wrapper">
        <div class="item" v-focusable v-for="item in 200" :key="item">{{ item }}</div>
      </div>
    </div>
    <script type="text/javascript" src="https://unpkg.com/vue@2.7.14/dist/vue.min.js"></script>
    <script
      type="text/javascript"
      src="https://unpkg.com/vue-focusable@1.3.2/lib/index.umd.cjs"
    ></script>
    <script type="text/javascript">
      Vue.use(
        VueFocusable({
          /** options */
        })
      );
      // 创建一个Vue实例
      var app = new Vue({
        el: '#app',
        data: {}
      });
      VueFocusable.next(document.querySelector('.item'));
    </script>
  </body>
</html>
```

在 div 上使用

```html
<!-- 设置可落焦元素 -->
<template>
  <div v-focusable>按钮</div>
</template>
```

```html
<!-- 限制焦点寻找区域为 v-limit-group 所在的元素 -->
<template>
  <div class="dialog" v-limit-group="visible">
    <div class="dialog__body">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
  const visible = defineModel({ type: Boolean, default: false });
</script>
```

```html
<!-- 如焦点在 v-scroll-group 包裹的元素里，超出时会触发滚动，可设置滚动方向 -->
<template>
  <div
    class="scroll-group"
    v-scroll-group="scrollGroup"
    @scrollIn="scrollIn"
    @scrollOut="scrollOut"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
  /**
   * @param direction: x | y，设置滚动方向，有 x，y 可选，如不填，则两个方向超出时都会触发滚动，填写有方向的情况下，焦点只会寻找十字相交方向上的下一个点，不会再寻找不相交的最近一个点
   * @param record: boolean，默认为 true，会自动记录离开滚动组前的落焦点，下次再进入时先去历史落焦点
   * @param focusFirst: boolean，默认为 false，第一次落焦到滚动组时是否寻找第一个可落焦元素
   * @param findFocusType: number，默认为 1，寻找焦点类型，0：优先寻找交叉方向上有交集的元素；1：找离当前焦点最近的一个元素
   * @param needScrollHidden: boolean，默认为 false，是否设置滚动时的 scroll-hidden 属性，用于标识当前滚动到顶还是底还是中部
   * @param rootScroll: boolean，默认为 true，设置焦点移动到当前滚动组时，向上递归查找的可滚动组件是否包含根元素
   */
  const scrollGroup = ref({
    direction: 'y',
    record: true
  });

  // 针对 v-scroll-group 元素的事件
  const scrollIn = () => {
    // 焦点进入滚动组时会触发一次
  };

  const scrollOut = () => {
    // 焦点离开滚动组时会触发一次
  };
</script>
```

## Options

初始化传参：

| 参数               | 说明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | 类型                 | 默认值        |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ------------- |
| `KEY_LEFT`         | 左按键 Key 值，当前落焦元素上触发                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | `Array`              | `[37, 21]`    |
| `KEY_UP`           | 上按键 Key 值，当前落焦元素上触发                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | `Array`              | `[38, 19]`    |
| `KEY_RIGHT`        | 右按键 Key 值，当前落焦元素上触发                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | `Array`              | `[39, 22]`    |
| `KEY_DOWN`         | 下按键 Key 值，当前落焦元素上触发                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | `Array`              | `[40, 20]`    |
| `KEY_ENTER`        | 回车键 Key 值，当前落焦元素上触发                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | `Array`              | `[13, 23]`    |
| `KEY_BACK`         | 返回键 Key 值，在 document 对象上触发                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | `Array`              | `[27, 10000]` |
| `itemAttrname`     | 可落焦元素的属性标识                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | `String`             | `focusable`   |
| `focusClassName`   | 当前落焦元素新增的 class 值                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | `String`             | `focus`       |
| `focusedAttrname`  | 当前落焦元素新增的属性值标识                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | `String`             | `focused`     |
| `pressedAttrname`  | 当前落焦元素按下回车键时增加的属性值标识                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | `String`             | `pressed`     |
| `easing`           | 控制滚动的动画，可选值有<br/>`Linear`<br/>`Quad.easeIn`、`Quad.easeOut`、`Quad.easeInOut`<br/>`Cubic.easeIn`、`Cubic.easeOut`、`Cubic.easeInOut`<br/>`Quart.easeIn`、`Quart.easeOut`、`Quart.easeInOut`<br/>`Quint.easeIn`、`Quint.easeOut`、`Quint.easeInOut`<br/>`Sine.easeIn`、`Sine.easeOut`、`Sine.easeInOut`<br/>`Expo.easeIn`、`Expo.easeOut`、`Expo.easeInOut`<br/>`Circ.easeIn`、`Circ.easeOut`、`Circ.easeInOut`<br/>`Elastic.easeIn`、`Elastic.easeOut`、`Elastic.easeInOut`<br/>`Back.easeIn`、`Back.easeOut`、`Back.easeInOut`<br/>`Bounce.easeIn`、`Bounce.easeOut`、`Bounce.easeInOut`<br/>默认为空，使用 `Quart.easeOut`<br/>(注：输入不合法的值时会使用默认值)<br/>动画示例可参考 [TWEEN.Easing][TWEEN.Easing] | `String \| Function` | `''`          |
| `smoothTime`       | 滚动动画的执行时间（ms）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | `Number`             | `800`         |
| `offsetDistanceX`  | X 轴方向距离边缘的距离（px）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | `Number`             | `50`          |
| `offsetDistanceY`  | Y 轴方向距离边缘的距离（px）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | `Number`             | `50`          |
| `longPressTime`    | 长按响应触发时长（ms）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | `Number`             | `700`         |
| `dblEnterTime`     | 双击响应触发时长（ms）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | `Number`             | `200`         |
| `scrollDelay`      | 长按或快速按方向键时的延迟                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | `Number`             | `0`           |
| `scrollHiddenTime` | 滚动组滚动时设置 scroll-hidden 的间隔时间                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | `Number`             | `200`         |
| `fps`              | 设置帧率，默认 false，可设置成 number，越大帧率越高                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | `Boolean \| Number`  | `false`       |
| `distanceToCenter` | 焦点是否在滚动区域居中，优先级比 offsetDistanceX 和 offsetDistanceY 高                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | `Boolean`            | `false`       |
| `touchpad`         | 是否支持触屏模式                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | `Boolean`            | `true`        |
| `autoFocus`        | 是否开启按方向键时自动寻焦                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | `Boolean`            | `true`        |
| `endToNext`        | 是否在上一个焦点滚动结束后再继续下一个焦点的落焦                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | `Boolean`            | `false`       |

方法：

| 事件名                            | 说明                                                      | 参数类型                                                                                                                                                                                                                                                                                                                                                                                    | 返回类型             |
| --------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| `next` <br/> (别名：requestFocus) | 获取特定的焦点，可传入特定的可落焦元素或方向              | 类型一：Element <br/> 类型二：'up' \| 'right' \| 'down' \| 'left' <br/> 类型三：{ <br/> [$el \| target]: Element \| 'up' \| 'right' \| 'down' \| 'left', <br/> smooth?: boolean, <br/> smoothTime?: number, <br/> end?: () => void, <br/> easing?: string \| ((val?: any) => any), <br/> distanceToCenter?: boolean, <br/> offsetDistanceX?: number, <br/> offsetDistanceY?: number <br/> } |                      |
| `getCurrFocusEl`                  | 获取当前落焦的元素，多焦点时获取的是当前最上层的落焦元素  | void                                                                                                                                                                                                                                                                                                                                                                                        | Element              |
| `getFocusableEls`                 | 获取当前层所有可落焦的元素                                | []                                                                                                                                                                                                                                                                                                                                                                                          | Element[]            |
| `getNextFocusEl`                  | 传入方向，获取下一个即将落焦的元素                        | `up` \| `right` \| `down` \| `left`                                                                                                                                                                                                                                                                                                                                                         | Element \| null      |
| `doAnimate`                       | 执行动画前计算各方向要滚动的距离                          | { <br/> focusEl: Element, <br/> scrollEl?: Element, <br/> smooth?: boolean, <br/> smoothTime?: number, <br/> end?: () => void, <br/> easing?: string \| Function, <br/> distanceToCenter?: boolean, <br/> offsetDistanceX?: number, <br/> offsetDistanceY?: number <br/> }                                                                                                                  | void                 |
| `getScrollEl`                     | 获取当前焦点元素所在块的滚动父元素                        | void                                                                                                                                                                                                                                                                                                                                                                                        | Element              |
| `getLastFocusEl`                  | 获取上一个落焦的元素                                      | void                                                                                                                                                                                                                                                                                                                                                                                        | Element \| undefined |
| `getLimitGroupEl`                 | 获取限制组元素元素                                        | void                                                                                                                                                                                                                                                                                                                                                                                        | Element              |
| `setLimitGroupEl`                 | 设置限制组元素元素                                        | Element[]                                                                                                                                                                                                                                                                                                                                                                                   | void                 |
| `limitGroupElsPush`               | 向限制组中 push 元素                                      | Element                                                                                                                                                                                                                                                                                                                                                                                     | Element              |
| `limitGroupElsPop`                | 删除限制组中最后一个                                      | void                                                                                                                                                                                                                                                                                                                                                                                        | Element \| undefined |
| `getDefaultConfig`                | 获取默认配置项的值（传入上面 Options 的值）               | String                                                                                                                                                                                                                                                                                                                                                                                      |                      |
| `updateScrollGroupRecord`         | 更新滚动组的历史元素记录                                  | { key: number, el: Element }                                                                                                                                                                                                                                                                                                                                                                | void                 |
| `setAutoFocus`                    | 设置是否响应键盘方向键，及点击事件                        | Boolean                                                                                                                                                                                                                                                                                                                                                                                     | void                 |
| `setDistanceToCenter`             | 设置全局滚动是否居中                                      | Boolean                                                                                                                                                                                                                                                                                                                                                                                     | void                 |
| `setOffsetDistance`               | 同时设置 `offsetDistanceX` 和 `setOffsetDistanceY` 的距离 | Number                                                                                                                                                                                                                                                                                                                                                                                      | void                 |
| `setOffsetDistanceX`              | 设置 `offsetDistanceX` 的距离                             | Number                                                                                                                                                                                                                                                                                                                                                                                      | void                 |
| `setOffsetDistanceY`              | 设置 `offsetDistanceY` 的距离                             | Number                                                                                                                                                                                                                                                                                                                                                                                      | void                 |
| `setSmoothTime`                   | 设置滚动持续时间                                          | Number                                                                                                                                                                                                                                                                                                                                                                                      | void                 |
| `setScrollDelay`                  | 设置快速点击或者按住方向键时的响应时间                    | Number                                                                                                                                                                                                                                                                                                                                                                                      | 0                    |
| `setEndToNext`                    | 设置是否当前元素滚动结束后再继续下一个焦点落焦            | Boolean                                                                                                                                                                                                                                                                                                                                                                                     | false                |
| `resetCounter`                    | 重置方向键计数器                                          |                                                                                                                                                                                                                                                                                                                                                                                             |                      |
| `scrollingElement`                | 全局的滚动元素（常量，非函数）                            | Element                                                                                                                                                                                                                                                                                                                                                                                     |                      |

事件：

| 事件名      | 说明           | 类型                    |
| ----------- | -------------- | ----------------------- |
| `up`        | 按上键时触发   | `(num: number) => void` |
| `right`     | 按右键时触发   | `(num: number) => void` |
| `down`      | 按下键时触发   | `(num: number) => void` |
| `left`      | 按左键时触发   | `(num: number) => void` |
| `onFocus`   | 元素落焦时触发 | `(e: Event) => void`    |
| `onBlur`    | 元素失焦时触发 | `(e: Event) => void`    |
| `enter`     | 元素单击时触发 | `(e: Event) => void`    |
| `dblenter`  | 元素双击时触发 | `(e: Event) => void`    |
| `longPress` | 元素长按时触发 | `(e: Event) => void`    |

## License

MIT © [Wu Ronghua](https://github.com/wrh8214158)

[npm-url]: https://github.com/wrh8214158/vue-focusable
[npm-image]: https://img.shields.io/npm/v/vue-focusable
[licence-url]: https://github.com/wrh8214158/vue-focusable/blob/main/LICENSE
[npm-licence]: https://img.shields.io/npm/l/vue-focusable
[size-url]: https://github.com/wrh8214158/vue-focusable
[npm-size]: https://img.shields.io/npm/unpacked-size/vue-focusable
[TWEEN.Easing]: https://www.zhangxinxu.com/study/201612/how-to-use-tween-js.html
