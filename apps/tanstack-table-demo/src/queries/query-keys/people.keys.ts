export const peopleKeys = {
  all: ["people"] as const,

  lists: () => [...peopleKeys.all, "list"] as const,

  person: (id: string) =>
    [...peopleKeys.lists(), "detail", id] as const,
}
