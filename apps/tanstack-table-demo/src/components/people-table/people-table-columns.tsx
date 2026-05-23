import { createColumnHelper } from "@tanstack/react-table"
import {
  ArchiveIcon,
  EditIcon,
  MoreHorizontalIcon,
  UserIcon,
} from "lucide-react"

import { Button } from "@web3-frontend-labs/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@web3-frontend-labs/ui/components/dropdown-menu"

import type { Person } from "@/types/people.types"

const columnHelper = createColumnHelper<Person>()

function getInitials(firstName: string, lastName: string) {
  return `${firstName.slice(0, 1)}${lastName.slice(0, 1)}`.toUpperCase()
}

function getStatusClassName(status: Person["status"]) {
  if (status === "In Relationship") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700"
  }

  if (status === "Complicated") {
    return "border-amber-200 bg-amber-50 text-amber-700"
  }

  return "border-slate-200 bg-slate-50 text-slate-700"
}

export const peopleTableColumns = [
  columnHelper.accessor("firstName", {
    header: "Name",
    cell: ({ row }) => {
      const person = row.original

      return (
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full border bg-muted text-xs font-semibold text-muted-foreground">
            {getInitials(person.firstName, person.lastName)}
          </div>

          <div className="min-w-0">
            <div className="font-medium text-foreground">
              {person.firstName} {person.lastName}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <UserIcon className="size-3" />
              <span className="font-mono">{person.id}</span>
            </div>
          </div>
        </div>
      )
    },
  }),
  columnHelper.accessor("age", {
    header: () => <div className="text-right">Age</div>,
    cell: (info) => (
      <div className="text-right tabular-nums">{info.getValue()}</div>
    ),
  }),
  columnHelper.accessor("visits", {
    header: () => <div className="text-right">Visits</div>,
    cell: (info) => (
      <div className="text-right tabular-nums">
        {new Intl.NumberFormat("en-US").format(info.getValue())}
      </div>
    ),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => {
      const status = info.getValue()

      return (
        <span
          className={[
            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
            getStatusClassName(status),
          ].join(" ")}
        >
          {status}
        </span>
      )
    },
  }),
  columnHelper.accessor("progress", {
    header: () => <div className="text-right">Profile Progress</div>,
    cell: (info) => {
      const value = info.getValue()

      return (
        <div className="flex min-w-40 items-center justify-end gap-3">
          <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-foreground"
              style={{ width: `${value}%` }}
            />
          </div>
          <span className="w-10 text-right text-sm tabular-nums text-muted-foreground">
            {value}%
          </span>
        </div>
      )
    },
  }),
  columnHelper.display({
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const person = row.original

      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontalIcon className="size-4" />
                <span className="sr-only">Open row actions</span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => console.log("View", person.id)}>
                <UserIcon className="size-4" />
                View profile
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => console.log("Edit", person.id)}>
                <EditIcon className="size-4" />
                Edit
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => console.log("Archive", person.id)}
                variant="destructive"
              >
                <ArchiveIcon className="size-4" />
                Archive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  }),
]
