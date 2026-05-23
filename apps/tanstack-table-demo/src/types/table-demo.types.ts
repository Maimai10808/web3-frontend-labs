export type Person = {
  id: string
  firstName: string
  lastName: string
  age: number
  visits: number
  status: "In Relationship" | "Single" | "Complicated"
  progress: number
}

export type PeopleResponse = {
  data: Person[]
}
