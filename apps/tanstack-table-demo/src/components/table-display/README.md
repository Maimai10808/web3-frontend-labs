# Table Display 模块说明

这个目录的 5 个文件可以看作一个小型“表格模块”：

```text
table-display/
  index.ts
  table-display.container.tsx
  table-display.tsx
  table-display-columns.tsx
  table-display-view.tsx
```

目标不是“为了拆而拆”，而是把 **数据请求**、**表格逻辑**、**UI 渲染** 分开，避免后续把功能都堆到一个大组件里。

---

## 1) `index.ts`

统一出口文件，给外部更干净的导入路径。

示例：

```ts
export { TableDisplayContainer } from "./table-display.container";
```

外部使用：

```ts
import { TableDisplayContainer } from "@/components/table-display";
```

通常很少改，只在你要新增对外暴露组件时改。

---

## 2) `table-display.container.tsx`

数据容器组件，职责是：

- 调用 React Query（如 `usePeopleQuery()`）
- 处理 `loading / error / empty`
- 请求成功后把 `data` 传给 `TableDisplay`

它不负责列定义，也不负责具体 `<TableCell />` UI。

适合修改的内容：

- 换 query / 接口
- loading、error、empty 样式
- `refetch` 按钮
- 多个 query 组合
- 服务端参数拼装（排序、分页条件等）

---

## 3) `table-display.tsx`

表格逻辑组件，职责是：

- 接收 `data`
- 组合 `columns`
- 创建 `useReactTable(...)`
- 配置 TanStack Table 功能
- 把 `table` 实例传给 `TableDisplayView`

适合修改的内容：

- sorting / pagination / rowSelection
- column visibility / column resizing
- `getSortedRowModel` / `getPaginationRowModel`
- `manualSorting` / `manualPagination`
- 表格 state 与 React state 的绑定

---

## 4) `table-display-columns.tsx`

列配置文件，职责是定义：

- 有哪些列
- 每列 header 文案
- 每列 cell 渲染方式
- display/actions 列

适合修改的内容：

- 新增/删除列
- 改列标题
- 格式化金额、日期、状态
- 增加 badge、按钮、dropdown action
- 控制列是否支持排序/隐藏

一句话：**列长什么样，改 columns 文件。**

---

## 5) `table-display-view.tsx`

纯 UI 渲染文件，职责是把 `table` 实例渲染成表格结构（如 shadcn/ui Table）。

它应只关心：

- Header/Body/Footer 的渲染
- 空状态、边框、间距、hover
- 横向滚动容器
- sticky header
- skeleton 结构

它不应关心：

- query 请求细节
- API 来源
- columns 定义细节
- sorting state 存储位置

一句话：**表格 UI 长什么样，改 view 文件。**

---

## 最简单记忆法

- `index.ts`：给外部导出用
- `table-display.container.tsx`：拿数据、处理 loading/error
- `table-display.tsx`：`useReactTable` 配置
- `table-display-columns.tsx`：列定义
- `table-display-view.tsx`：表格 UI 渲染

---

## 改动定位速查表

| 你想改什么 | 改哪个文件 |
| --- | --- |
| 换接口 / 换 query | `queries/`、`services/`、`table-display.container.tsx` |
| loading 样式 | `table-display.container.tsx` |
| error 样式 | `table-display.container.tsx` |
| 成功后 data 传递方式 | `table-display.container.tsx` |
| 新增一列 | `table-display-columns.tsx` |
| 删除一列 | `table-display-columns.tsx` |
| 修改 cell 显示 | `table-display-columns.tsx` |
| 加 row action 按钮 | `table-display-columns.tsx` |
| 加排序功能 | `table-display.tsx`（必要时 `table-display-columns.tsx`） |
| 加分页功能 | `table-display.tsx`（服务端分页还要改 container/query/service） |
| 加 selection | `table-display.tsx` + `table-display-view.tsx` |
| 改边框/间距/hover | `table-display-view.tsx` |
| 加横向滚动 | `table-display-view.tsx` |
| 加 sticky header | `table-display-view.tsx` |
| 页面标题和整体布局 | `app/page.tsx` |

---

## 实践原则

形成固定习惯：

- 拿数据：`container`
- 配表格：`table-display`
- 配列：`columns`
- 画 UI：`view`

这样后续加排序、过滤、分页、虚拟滚动时，代码会稳定很多，也更容易维护。
