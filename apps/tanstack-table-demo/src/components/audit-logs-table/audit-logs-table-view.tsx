"use client"

import * as React from "react"

import {
  flexRender,
  type Table as TanStackTable,
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@web3-frontend-labs/ui/components/table"

import type { AuditLogEvent } from "@/types/audit-logs.types"

type AuditLogsTableViewProps = {
  table: TanStackTable<AuditLogEvent>
  columnCount: number
}

export function AuditLogsTableView({
  table,
  columnCount,
}: AuditLogsTableViewProps) {
  const parentRef = React.useRef<HTMLDivElement | null>(null)

  const rows = table.getRowModel().rows

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44,
    overscan: 10,
  })

  const virtualRows = rowVirtualizer.getVirtualItems()
  const totalSize = rowVirtualizer.getTotalSize()

  return (
    <div className="space-y-3">
      <div
        ref={parentRef}
        className="relative h-[600px] overflow-auto rounded-md border"
      >
        <Table className="grid min-w-max">
          <TableHeader className="sticky top-0 z-10 grid bg-background">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="flex w-full">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="flex min-w-[160px] items-center"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody
            className="relative grid"
            style={{ height: `${totalSize}px` }}
          >
            {virtualRows.length ? (
              virtualRows.map((virtualRow) => {
                const row = rows[virtualRow.index]

                if (!row) {
                  return null
                }

                return (
                  <TableRow
                    key={row.id}
                    data-index={virtualRow.index}
                    className="absolute left-0 flex w-full hover:bg-muted/50"
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="flex min-w-[160px] items-center whitespace-nowrap"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columnCount} className="h-24 text-center">
                  No audit logs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        Rendering {virtualRows.length} visible rows out of {rows.length} rows.
      </div>
    </div>
  )
}
