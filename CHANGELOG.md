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
