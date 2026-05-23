import {
  flexRender,
  type Table as TanStackTable,
} from "@tanstack/react-table"
import {
  DownloadIcon,
  FilterIcon,
  RefreshCwIcon,
  SearchIcon,
  UsersIcon,
} from "lucide-react"

import { Button } from "@web3-frontend-labs/ui/components/button"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@web3-frontend-labs/ui/components/table"

import type { Person } from "@/types/people.types"

type PeopleTableViewProps = {
  table: TanStackTable<Person>
  columnCount: number
}

export function PeopleTableView({
  table,
  columnCount,
}: PeopleTableViewProps) {
  const rowCount = table.getRowModel().rows.length

  return (
    <section className="overflow-hidden rounded-xl border bg-background shadow-sm">
      <div className="flex flex-col gap-4 border-b bg-muted/20 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg border bg-background">
              <UsersIcon className="size-4 text-muted-foreground" />
            </div>

            <div>
              <h3 className="text-base font-semibold tracking-tight">
                People Directory
              </h3>
              <p className="text-sm text-muted-foreground">
                Manage team members, visits and profile completion status.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search people..."
              className="h-9 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/40 sm:w-64"
            />
          </div>

          <Button variant="outline" size="sm" className="gap-2">
            <FilterIcon className="size-4" />
            Filter
          </Button>

          <Button variant="outline" size="sm" className="gap-2">
            <DownloadIcon className="size-4" />
            Export
          </Button>

          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCwIcon className="size-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/40">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-11 whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-muted-foreground"
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

          <TableBody>
            {rowCount ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="group border-b transition-colors hover:bg-muted/40"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="h-14 whitespace-nowrap">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columnCount}
                  className="h-56 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-full border bg-muted/30">
                      <UsersIcon className="size-5 text-muted-foreground" />
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm font-medium">
                        No people found
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Try adjusting your search or filter criteria.
                      </div>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>

          <TableFooter className="bg-muted/20">
            {table.getFooterGroups().map((footerGroup) => (
              <TableRow key={footerGroup.id} className="hover:bg-transparent">
                {footerGroup.headers.map((header) => (
                  <TableCell
                    key={header.id}
                    className="h-11 whitespace-nowrap text-xs font-normal text-muted-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.footer,
                          header.getContext(),
                        )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableFooter>
        </Table>
      </div>

      <div className="flex items-center justify-between border-t bg-muted/20 px-5 py-3 text-sm text-muted-foreground">
        <div>
          Showing{" "}
          <span className="font-medium text-foreground">{rowCount}</span>{" "}
          records
        </div>

        <div className="hidden sm:block">
          Updated from local backend API
        </div>
      </div>
    </section>
  )
}
