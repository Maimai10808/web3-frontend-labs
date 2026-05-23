import { PeopleTableContainer } from "@/components/people-table"
import { Web3ActivitiesTableContainer } from "@/components/web3-activities-table"
import { AuditLogsTableContainer } from "@/components/audit-logs-table"

export default function Page() {
  return (
    <main className="mx-auto max-w-7xl space-y-10 p-6">
      <section className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            TanStack Table Lab
          </h1>
          <p className="text-sm text-muted-foreground">
            Testing TanStack Table with React Query and shared shadcn/ui
            components.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            People Table
          </h2>
          <p className="text-sm text-muted-foreground">
            Small table for basic table structure and query state.
          </p>
        </div>

        <PeopleTableContainer />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Web3 Activities Table
          </h2>
          <p className="text-sm text-muted-foreground">
            Wider Web3 activity dataset for testing table rendering and
            horizontal scrolling.
          </p>
        </div>

        <Web3ActivitiesTableContainer />
      </section>

      <section className="space-y-4">
  <div>
    <h2 className="text-xl font-semibold tracking-tight">
      Audit Logs Virtual Table
    </h2>
    <p className="text-sm text-muted-foreground">
      Large audit log dataset rendered with TanStack Virtual.
    </p>
  </div>

  <AuditLogsTableContainer />
</section>


    </main>
  )
}
