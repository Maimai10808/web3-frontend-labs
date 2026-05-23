export const tableDemoKeys = {
  all: ["table-demo"] as const,

  people: () => [...tableDemoKeys.all, "people"] as const,

  person: (id: string) =>
    [...tableDemoKeys.people(), "detail", id] as const,
}
