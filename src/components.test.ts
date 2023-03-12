import { assertEquals } from 'https://deno.land/std@0.179.0/testing/asserts.ts'
import { parseSkinTones } from './components.ts'

const skinToneData = {
  groups: [{
    group: 'Group',
    subgroups: [{
      subgroup: 'Subgroup',
      emoji: [
        { emoji: '🧑', name: 'person' },
        { emoji: '🧑🏻', name: 'person: light skin tone' },
        { emoji: '🧑🏼', name: 'person: medium-light skin tone' },
        { emoji: '🧑🏽', name: 'person: medium skin tone' },
        { emoji: '🧑🏾', name: 'person: medium-dark skin tone' },
        { emoji: '🧑🏿', name: 'person: dark skin tone' },
      ],
    }],
  }],
  components: [{
    subgroup: 'skin-tone',
    emoji: [
      { emoji: '🏻', name: 'light skin tone' },
      { emoji: '🏼', name: 'medium-light skin tone' },
      { emoji: '🏽', name: 'medium skin tone' },
      { emoji: '🏾', name: 'medium-dark skin tone' },
      { emoji: '🏿', name: 'dark skin tone' },
    ],
  }],
}

const skinToneAndHairStyleData = {
  groups: [{
    group: 'Group',
    subgroups: [{
      subgroup: 'Subgroup',
      emoji: [
        { emoji: '👩‍🦰', name: 'woman: red hair' },
        { emoji: '👩🏻‍🦰', name: 'woman: light skin tone, red hair' },
        { emoji: '👩🏿‍🦰', name: 'woman: dark skin tone, red hair' },
      ],
    }],
  }],
  components: [{
    subgroup: 'skin-tone',
    emoji: [
      { emoji: '🏻', name: 'light skin tone' },
      { emoji: '🏿', name: 'dark skin tone' },
    ],
  }, {
    subgroup: 'hair-style',
    emoji: [
      { emoji: '🦰', name: 'red hair' },
    ],
  }],
}

Deno.test('Parse Skin Tone Variants', () => {
  const filtered = parseSkinTones(skinToneData)

  assertEquals(filtered[0].subgroups[0].emoji.length, 1)
  assertEquals(filtered[0].subgroups[0].emoji[0], {
    emoji: '🧑',
    name: 'person',
    skinTones: [
      '🧑🏻',
      '🧑🏼',
      '🧑🏽',
      '🧑🏾',
      '🧑🏿',
    ],
  })
})

Deno.test('Parse Skin Tone Variants With Hair Style', () => {
  const filtered = parseSkinTones(skinToneAndHairStyleData)

  assertEquals(filtered[0].subgroups[0].emoji.length, 1)
  assertEquals(filtered[0].subgroups[0].emoji[0], {
    emoji: '👩‍🦰',
    name: 'woman: red hair',
    skinTones: ['👩🏻‍🦰', '👩🏿‍🦰'],
  })
})
