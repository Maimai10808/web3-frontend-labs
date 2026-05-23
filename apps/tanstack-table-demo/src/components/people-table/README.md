# People Table Module

这个目录是一个小型表格模块，核心目标是职责分离，避免把 API、表格逻辑、UI 全堆在一个文件里。

```text
people-table/
  index.ts
  people-table.container.tsx
  people-table.tsx
  people-table-columns.tsx
  people-table-view.tsx
```

## File Responsibilities

### `index.ts`

统一出口，给外部稳定导入路径：

```ts
import { PeopleTableContainer } from "@/components/people-table"
```

---

### `people-table.container.tsx`

数据容器层：

- 调用 `usePeopleQuery`
- 处理 loading / error / empty（可选）
- 成功后把数据传给 `PeopleTable`

不要在这里写列定义或表格渲染细节。

---

### `people-table.tsx`

表格逻辑层：

- 接收 `data`
- 创建 `useReactTable(...)`
- 组装 TanStack Table 功能（排序、分页、选择等）
- 把 table 实例传给 `PeopleTableView`

---

### `people-table-columns.tsx`

列配置层：

- 定义列
- header 文案
- cell 渲染
- action 列
- 是否支持排序/隐藏

一句话：列长什么样，改这个文件。

---

### `people-table-view.tsx`

纯 UI 渲染层：

- 使用 `table.getHeaderGroups()` / `table.getRowModel()` 渲染
- 控制表格视觉样式（边框、hover、空状态、滚动等）

不要在这里写 query 请求或业务数据组装。

---

## Quick Mapping

| 你想改什么 | 改哪个文件 |
| --- | --- |
| 换接口 / 换 query | `queries/*`、`services/*`、`people-table.container.tsx` |
| loading/error 样式 | `people-table.container.tsx` |
| 新增/删除列 | `people-table-columns.tsx` |
| 修改 cell 显示 | `people-table-columns.tsx` |
| 加 sorting/pagination/selection | `people-table.tsx`（必要时改 columns） |
| 改边框、hover、空状态 | `people-table-view.tsx` |
| 页面整体布局 | `src/app/page.tsx` |

## Team Rule

- 拿数据：`container`
- 配表格：`people-table.tsx`
- 配列：`people-table-columns.tsx`
- 画 UI：`people-table-view.tsx`

这样后续扩展 `web3-activities-table` 时可以复用同样模式。
