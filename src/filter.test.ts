import { assertEquals } from 'https://deno.land/std@0.179.0/testing/asserts.ts'
import { filterGroupsWithoutEmoji } from './filter.ts'

Deno.test('Filter Groups Without Emoji', () => {
  const filtered = filterGroupsWithoutEmoji({
    groups: [
      {
        group: 'Group',
        subgroups: [{
          subgroup: 'Subgroup',
          emoji: [{ emoji: '1️⃣', name: '' }, { emoji: '2️⃣', name: '' }],
        }],
      },
      {
        group: 'Group',
        subgroups: [
          { subgroup: 'Subgroup', emoji: [] },
          { subgroup: 'Subgroup', emoji: [] },
        ],
      },
    ],
    components: [],
  })

  assertEquals(filtered.groups.length, 1)
})
