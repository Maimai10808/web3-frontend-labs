import { createColumnHelper } from "@tanstack/react-table"

import type { Person } from "@/types/table-demo.types"

const columnHelper = createColumnHelper<Person>()

export const tableDisplayColumns = [
  columnHelper.accessor("firstName", {
    header: "First Name",
    cell: (info) => info.getValue(),
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("lastName", {
    header: "Last Name",
    cell: (info) => <i>{info.getValue()}</i>,
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("age", {
    header: "Age",
    cell: (info) => info.renderValue(),
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("visits", {
    header: "Visits",
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("status", {
    header: "Status",
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("progress", {
    header: "Profile Progress",
    footer: (info) => info.column.id,
  }),
]
