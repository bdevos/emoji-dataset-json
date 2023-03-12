import { assertEquals } from 'https://deno.land/std@0.179.0/testing/asserts.ts'
import { matchEmoji, matchGroup, matchSubgroup } from './match.ts'

Deno.test('Match Group', () => {
  assertEquals(
    matchGroup('# group: Smileys & Emotion'),
    'Smileys & Emotion',
  )

  assertEquals(
    matchGroup('# subgroup: face-smiling'),
    undefined,
  )
})

Deno.test('Match Subgroup', () => {
  assertEquals(
    matchSubgroup('# subgroup: face-smiling'),
    'face-smiling',
  )

  assertEquals(
    matchSubgroup('# group: Smileys & Emotion'),
    undefined,
  )
})

Deno.test('Match Emoji', () => {
  assertEquals(
    matchEmoji(
      '1F600                                                  ; fully-qualified     # 😀 E1.0 grinning face',
    ),
    { status: 'fully-qualified', emoji: '😀', name: 'grinning face' },
  )
  assertEquals(
    matchEmoji(
      '1F469 1F3FC 200D 1F9B0                                 ; fully-qualified     # 👩🏼‍🦰 E11.0 woman: medium-light skin tone, red hair',
    ),
    {
      status: 'fully-qualified',
      emoji: '👩🏼‍🦰',
      name: 'woman: medium-light skin tone, red hair',
    },
  )
  assertEquals(
    matchEmoji(
      '1F471 200D 2640                                        ; minimally-qualified # 👱‍♀ E4.0 woman: blond hair',
    ),
    {
      status: 'minimally-qualified',
      emoji: '👱‍♀',
      name: 'woman: blond hair',
    },
  )

  assertEquals(
    matchEmoji('# group: Smileys & Emotion'),
    {},
  )
})
