import { assertEquals } from 'https://deno.land/std@0.179.0/testing/asserts.ts'
import { emojiCount } from './count.ts'

const data = {
  groups: [
    {
      group: 'Group',
      subgroups: [{
        subgroup: 'Subgroup',
        emoji: [{ emoji: '1️⃣', name: '' }, { emoji: '2️⃣', name: '' }],
      }, {
        subgroup: 'Subgroup',
        emoji: [{ emoji: '3️⃣', name: '' }],
      }],
    },
    {
      group: 'Group',
      subgroups: [
        { subgroup: 'Subgroup', emoji: [{ emoji: '4️⃣', name: '' }] },
        {
          subgroup: 'Subgroup',
          emoji: [{ emoji: '5️⃣', name: '' }, { emoji: '6️⃣', name: '' }],
        },
      ],
    },
  ],
  components: [],
}

Deno.test('Emoji Count', () => {
  assertEquals(emojiCount(data), 6)
})
