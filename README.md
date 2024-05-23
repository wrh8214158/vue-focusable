# vue-focusable

[![NPM Version][npm-image]][npm-url] [![NPM License][npm-licence]][licence-url] [![NPM Unpacked Size][npm-size]][size-url]

> An auto-focusable lib for Vue

<div align="center">
  <a href="https://github.com/wrh8214158/vue-focusable">
   <img src="https://raw.githubusercontent.com/wrh8214158/vue-focusable/main/assets/logo.svg" alt="logo" />
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
  focusable({
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
  <div class="scroll-group" v-scroll-group="direction">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
  const direction = ref('y'); // 设置滚动方向，有 x，y 可选，如不填，则两个方向都会滚动
</script>
```

## Options

初始化传参：

| 参数               | 说明                                                                                         | 类型                 | 默认值        |
| ------------------ | -------------------------------------------------------------------------------------------- | -------------------- | ------------- |
| `KEY_LEFT`         | 左按键 Key 值，当前落焦元素上触发                                                            | `Array`              | `[37, 21]`    |
| `KEY_UP`           | 上按键 Key 值，当前落焦元素上触发                                                            | `Array`              | `[38, 19]`    |
| `KEY_RIGHT`        | 右按键 Key 值，当前落焦元素上触发                                                            | `Array`              | `[39, 22]`    |
| `KEY_DOWN`         | 下按键 Key 值，当前落焦元素上触发                                                            | `Array`              | `[40, 20]`    |
| `KEY_ENTER`        | 回车键 Key 值，当前落焦元素上触发                                                            | `Array`              | `[13, 23]`    |
| `KEY_BACK`         | 返回键 Key 值，在 document 对象上触发                                                        | `Array`              | `[27, 10000]` |
| `itemAttrname`     | 可落焦元素的属性标识                                                                         | `String`             | `focusable`   |
| `focusClassName`   | 当前落焦元素新增的 class 值                                                                  | `String`             | `focus`       |
| `focusedAttrname`  | 当前落焦元素新增的属性值标识                                                                 | `String`             | `focused`     |
| `pressedAttrname`  | 当前落焦元素按下回车键时增加的属性值标识                                                     | `String`             | `pressed`     |
| `easing`           | 控制滚动的动画，与 [TWEEN.Easing][TWEEN.Easing] 的参数一致，默认为空，使用 `Quadratic.InOut` | `String \| Function` | `''`          |
| `smoothTime`       | 滚动动画的执行时间（ms）                                                                     | `Number`             | `300`         |
| `offsetDistanceX`  | X 轴方向距离边缘的距离（px）                                                                 | `Number`             | `50`          |
| `offsetDistanceY`  | Y 轴方向距离边缘的距离（px）                                                                 | `Number`             | `50`          |
| `longPressTime`    | 长按响应触发时长（ms）                                                                       | `Number`             | `700`         |
| `dblEnterTime`     | 双击响应触发时长（ms）                                                                       | `Number`             | `200`         |
| `distanceToCenter` | 焦点是否在滚动区域居中，优先级比 offsetDistanceX 和 offsetDistanceY 高                       | `Boolean`            | `false`       |
| `touchpad`         | 是否支持触屏模式                                                                             | `Boolean`            | `true`        |
| `autoFocus`        | 是否开启按方向键时自动寻焦                                                                   | `Boolean`            | `true`        |
| `setCountAttr`     | 是否开启焦点在同一元素移动时增加特定属性标识，可用于做 shake 动画                            | `Boolean`            | `true`        |

方法：

| 事件名                | 说明                                                      | 参数类型                                                                                                                                                                                                                                                                                                                                                                                    | 返回类型             |
| --------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| `next`                | 获取特定的焦点，可传入特定的可落焦元素或方向              | 类型一：Element <br/> 类型二：'up' \| 'right' \| 'down' \| 'left' <br/> 类型三：{ <br/> [$el \| target]: Element \| 'up' \| 'right' \| 'down' \| 'left', <br/> smooth?: boolean, <br/> smoothTime?: number, <br/> end?: () => void, <br/> easing?: string \| ((val?: any) => any), <br/> distanceToCenter?: boolean, <br/> offsetDistanceX?: number, <br/> offsetDistanceY?: number <br/> } |                      |
| `getCurrFocusEl`      | 获取当前落焦的元素，多焦点时获取的是当前最上层的落焦元素  |                                                                                                                                                                                                                                                                                                                                                                                             | Element              |
| `getFocusableEls`     | 获取当前层所有可落焦的元素                                | []                                                                                                                                                                                                                                                                                                                                                                                          | Element[]            |
| `getNextFocusEl`      | 传入方向，获取下一个即将落焦的元素                        | `up` \| `right` \| `down` \| `left`                                                                                                                                                                                                                                                                                                                                                         | Element \| null      |
| `doAnimate`           | 执行动画前计算各方向要滚动的距离                          | { <br/> focusEl: Element, <br/> scrollEl?: Element, <br/> smooth?: boolean, <br/> smoothTime?: number, <br/> end?: () => void, <br/> easing?: string \| Function, <br/> distanceToCenter?: boolean, <br/> offsetDistanceX?: number, <br/> offsetDistanceY?: number <br/> }                                                                                                                  | void                 |
| `getScrollEl`         | 获取当前焦点元素所在块的滚动父元素                        | void                                                                                                                                                                                                                                                                                                                                                                                        | Element              |
| `getRootScrollEl`     | 获取全局的限制组元素                                      | void                                                                                                                                                                                                                                                                                                                                                                                        | Element              |
| `getLastFocusEl`      | 获取上一个落焦的元素                                      | void                                                                                                                                                                                                                                                                                                                                                                                        | Element \| undefined |
| `getLimitGroupEl`     | 获取限制组元素元素                                        | void                                                                                                                                                                                                                                                                                                                                                                                        | Element              |
| `setLimitGroupEl`     | 设置限制组元素元素                                        | Element[]                                                                                                                                                                                                                                                                                                                                                                                   | void                 |
| `limitGroupElsPush`   | 向限制组中 push 元素                                      | Element                                                                                                                                                                                                                                                                                                                                                                                     | Element              |
| `limitGroupElsPop`    | 删除限制组中最后一个                                      | void                                                                                                                                                                                                                                                                                                                                                                                        | Element \| undefined |
| `setAutoFocus`        | 设置是否响应键盘方向键，及点击事件                        | boolean                                                                                                                                                                                                                                                                                                                                                                                     | void                 |
| `setDistanceToCenter` | 设置全局滚动是否居中                                      | boolean                                                                                                                                                                                                                                                                                                                                                                                     | void                 |
| `setOffsetDistance`   | 同时设置 `offsetDistanceX` 和 `setOffsetDistanceY` 的距离 | number                                                                                                                                                                                                                                                                                                                                                                                      | void                 |
| `setOffsetDistanceX`  | 设置 `offsetDistanceX` 的距离                             | number                                                                                                                                                                                                                                                                                                                                                                                      | void                 |
| `setOffsetDistanceY`  | 设置 `offsetDistanceY` 的距离                             | number                                                                                                                                                                                                                                                                                                                                                                                      | void                 |

事件：

| 事件名      | 说明           | 类型                    |
| ----------- | -------------- | ----------------------- |
| `left`      | 按左键时触发   | `(num: number) => void` |
| `up`        | 按上键时触发   | `(num: number) => void` |
| `right`     | 按右键时触发   | `(num: number) => void` |
| `down`      | 按下键时触发   | `(num: number) => void` |
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
[TWEEN.Easing]: https://github.com/tweenjs/tween.js/blob/main/docs/user_guide_zh-CN.md#%E5%8F%AF%E7%94%A8%E7%9A%84%E7%BC%93%E5%8A%A8%E5%87%BD%E6%95%B0tweeneasing
