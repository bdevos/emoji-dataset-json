import {
  assertEquals,
  assertThrows,
} from 'https://deno.land/std@0.179.0/testing/asserts.ts'
import { parseLines, splitLines } from './parse.ts'

const text = `
# emoji-test.txt
# Date: 2022-08-12, 20:24:39 GMT
# ยฉ 2022 Unicodeยฎ, Inc.

# group: Smileys & Emotion

# subgroup: face-smiling
1F600                                                  ; fully-qualified     # ๐ E1.0 grinning face
1F603                                                  ; fully-qualified     # ๐ E0.6 grinning face with big eyes

# subgroup: face-affection
263A FE0F                                              ; fully-qualified     # โบ๏ธ E0.6 smiling face
263A                                                   ; unqualified         # โบ E0.6 smiling face

# group: Component

# subgroup: skin-tone
1F3FB                                                  ; component           # ๐ป E1.0 light skin tone
1F3FF                                                  ; component           # ๐ฟ E1.0 dark skin tone

# subgroup: hair-style
1F9B0                                                  ; component           # ๐ฆฐ E11.0 red hair

# Component subtotal:		9
# Component subtotal:		4	w/o modifiers

# group: People & Body

# subgroup: person
1F9D4                                                  ; fully-qualified     # ๐ง E5.0 person: beard
1F9D4 1F3FB                                            ; fully-qualified     # ๐ง๐ป E5.0 person: light skin tone, beard
1F9D4 1F3FC                                            ; fully-qualified     # ๐ง๐ผ E5.0 person: medium-light skin tone, beard
1F9D4 1F3FD                                            ; fully-qualified     # ๐ง๐ฝ E5.0 person: medium skin tone, beard
1F9D4 1F3FE                                            ; fully-qualified     # ๐ง๐พ E5.0 person: medium-dark skin tone, beard
1F9D4 1F3FF                                            ; fully-qualified     # ๐ง๐ฟ E5.0 person: dark skin tone, beard
1F9D4 200D 2642 FE0F                                   ; fully-qualified     # ๐งโโ๏ธ E13.1 man: beard
1F9D4 200D 2642                                        ; minimally-qualified # ๐งโโ E13.1 man: beard`

Deno.test('Parse Lines', () => {
  const parsed = parseLines(splitLines(text))

  assertEquals(parsed.groups.length, 2)
  assertEquals(parsed.groups[0].group, 'Smileys & Emotion')
  assertEquals(parsed.groups[0].subgroups.length, 2)

  assertEquals(parsed.groups[0].subgroups[0].subgroup, 'face-smiling')
  assertEquals(parsed.groups[0].subgroups[0].emoji.length, 2)
  assertEquals(parsed.groups[0].subgroups[0].emoji[0], {
    emoji: '๐',
    name: 'grinning face',
  })
  assertEquals(parsed.groups[0].subgroups[0].emoji[1], {
    emoji: '๐',
    name: 'grinning face with big eyes',
  })

  assertEquals(parsed.groups[0].subgroups[1].subgroup, 'face-affection')
  assertEquals(parsed.groups[0].subgroups[1].emoji.length, 1)
  assertEquals(parsed.groups[0].subgroups[1].emoji[0], {
    emoji: 'โบ๏ธ',
    name: 'smiling face',
    alt: ['โบ'],
  })

  assertEquals(parsed.groups[1].group, 'People & Body')
  assertEquals(parsed.groups[1].subgroups.length, 1)

  assertEquals(parsed.groups[1].subgroups[0].subgroup, 'person')
  assertEquals(parsed.groups[1].subgroups[0].emoji.length, 7)
  assertEquals(parsed.groups[1].subgroups[0].emoji[6], {
    emoji: '๐งโโ๏ธ',
    name: 'man: beard',
    alt: ['๐งโโ'],
  })

  assertEquals(parsed.components.length, 2)
  assertEquals(parsed.components[0].subgroup, 'skin-tone')
  assertEquals(parsed.components[0].emoji.length, 2)

  assertEquals(parsed.components[1].subgroup, 'hair-style')
  assertEquals(parsed.components[1].emoji.length, 1)
  assertEquals(parsed.components[1].emoji[0], { emoji: '๐ฆฐ', name: 'red hair' })
})

Deno.test('Parse Lines: No Subgroup', () => {
  const noSubgroupText = `
  '# group: Smileys & Emotion',
      '1F600                                                  ; fully-qualified     # ๐ E1.0 grinning face',`

  assertThrows(() => {
    parseLines(splitLines(noSubgroupText))
  })
})
