# vue-focusable

> An auto-focusable lib for Vue

<div align="center">
  <a href="https://github.com/wrh8214158/vue-focusable">
   <svg t="1716349150276" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="10962" data-spm-anchor-id="a313x.search_index.0.i0.7d903a81QU2PQY" width="150" height="150"><path d="M317.44 0H102.4C47.786667 0 0 47.786667 0 102.4v215.04c0 10.24 6.826667 17.066667 17.066667 17.066667s17.066667-6.826667 17.066666-17.066667V102.4c0-37.546667 30.72-68.266667 68.266667-68.266667h215.04c10.24 0 17.066667-6.826667 17.066667-17.066666S327.68 0 317.44 0zM921.6 0h-215.04c-10.24 0-17.066667 6.826667-17.066667 17.066667s6.826667 17.066667 17.066667 17.066666H921.6c37.546667 0 68.266667 30.72 68.266667 68.266667v215.04c0 10.24 6.826667 17.066667 17.066666 17.066667s17.066667-6.826667 17.066667-17.066667V102.4c0-54.613333-47.786667-102.4-102.4-102.4zM317.44 989.866667H102.4c-37.546667 0-68.266667-30.72-68.266667-68.266667v-215.04c0-10.24-6.826667-17.066667-17.066666-17.066667s-17.066667 6.826667-17.066667 17.066667V921.6c0 58.026667 47.786667 102.4 102.4 102.4h215.04c10.24 0 17.066667-6.826667 17.066667-17.066667s-6.826667-17.066667-17.066667-17.066666zM1006.933333 689.493333c-10.24 0-17.066667 6.826667-17.066666 17.066667V921.6c0 37.546667-30.72 68.266667-68.266667 68.266667h-215.04c-10.24 0-17.066667 6.826667-17.066667 17.066666s6.826667 17.066667 17.066667 17.066667H921.6c58.026667 0 102.4-47.786667 102.4-102.4v-215.04c0-10.24-6.826667-17.066667-17.066667-17.066667zM563.2 409.6h-102.4c-27.306667 0-51.2 23.893333-51.2 51.2v102.4c0 27.306667 23.893333 51.2 51.2 51.2h102.4c27.306667 0 51.2-23.893333 51.2-51.2v-102.4c0-27.306667-23.893333-51.2-51.2-51.2zM904.533333 614.4c27.306667 0 51.2-23.893333 51.2-51.2v-102.4c0-27.306667-23.893333-51.2-51.2-51.2h-102.4c-27.306667 0-51.2 23.893333-51.2 51.2v102.4c0 27.306667 23.893333 51.2 51.2 51.2h102.4zM221.866667 614.4c27.306667 0 51.2-23.893333 51.2-51.2v-102.4c0-27.306667-23.893333-51.2-51.2-51.2h-102.4c-27.306667 0-51.2 23.893333-51.2 51.2v102.4c0 27.306667 23.893333 51.2 51.2 51.2h102.4zM563.2 750.933333h-102.4c-27.306667 0-51.2 23.893333-51.2 51.2v102.4c0 27.306667 23.893333 51.2 51.2 51.2h102.4c27.306667 0 51.2-23.893333 51.2-51.2v-102.4c0-27.306667-23.893333-51.2-51.2-51.2zM563.2 68.266667h-102.4c-27.306667 0-51.2 23.893333-51.2 51.2v102.4c0 27.306667 23.893333 51.2 51.2 51.2h102.4c27.306667 0 51.2-23.893333 51.2-51.2v-102.4c0-27.306667-23.893333-51.2-51.2-51.2z" fill="#e0620d" p-id="10963"></path></svg>
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

## License

MIT © [Wu Ronghua](https://github.com/wrh8214158)

[TWEEN.Easing]: https://github.com/tweenjs/tween.js/blob/main/docs/user_guide_zh-CN.md#%E5%8F%AF%E7%94%A8%E7%9A%84%E7%BC%93%E5%8A%A8%E5%87%BD%E6%95%B0tweeneasing
