import type { Data } from './parse.ts'

// This is only to filter away 'Component' which contains no 'fully-qualified' emoji
export const filterGroupsWithoutEmoji = (
  { components, groups }: Data,
): Data => ({
  groups: groups.filter(({ subgroups }) =>
    subgroups.some(({ emoji }) => emoji.length > 0)
  ),
  components,
})
