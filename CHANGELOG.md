## 1.3.2 (2024-10-08)

- `limitGroup` 自定义指令增加 `unmounted` 周期
- `Vue2` 周期名更改
- `doAnimate` 滚动距离优化

## 1.3.1 (2024-09-03)

- 优化 `doAnimate` 方法的上下左右逻辑

## 1.3.0 (2024-08-30)

- 全局导出方法增加 `updateScrollGroupRecord`
- defaultConfig 方法新增 `scrollHiddenTime`，`fps`，去除 `setCountAttr`
- scrollGroup 指令新增 `focusFirst`，`findFocusType`，`needScrollHidden`，`rootScroll` 参数
- 底层滚动方法优化，提升性能

## 1.2.0 (2024-07-26)

### Bug Fixes

- 修复 `Vue2` 自定义指令支持
- 修复 `document.scrollingElement` 寻找不对的问题
- 修复多层 `v-scroll-group` 嵌套时，滚动条位置不正确的问题
- 修复 `doAnimate` 的计算逻辑
- 去除所有 dependencies 依赖，由库实现
- 兼容低端浏览器，目前兼容到 `Chrome 17` 以及 `Android 4.3`

## 1.1.0 (2024-05-23)

### Bug Fixes

- 修复用 `v-scroll-group` 时的优先原则，在 `scroll-group` 里移动的 `item` 遵循先在 `scroll-group` 里移动到顶，再出框
