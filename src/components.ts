import type { Data, Emoji, Group, Subgroup } from './parse.ts'

const zeroWidthJoiner = '‍'

const flattenEmoji = (components: Subgroup[], name: string) =>
  components
    .find(({ subgroup }) => name === subgroup)?.emoji
    .map(({ emoji }) => emoji) ?? []

const filterSkinToneVariations = (
  base: Emoji,
  compare: Emoji,
  skinTones: string[],
  hairStyle: string | undefined,
) =>
  hairStyle // The logic for finding skin tone variations if different when a hair style component is involved
    ? skinTones.some((skinTone) =>
      compare.emoji ===
        base.emoji.replace(hairStyle, '').replace(
            zeroWidthJoiner,
            '',
          ) + skinTone + zeroWidthJoiner + hairStyle
    )
    : skinTones.some((skinTone) =>
      compare.emoji === base.emoji + skinTone ||
      base.alt?.some((alt) => compare.emoji === alt + skinTone)
    )

const parseSkinToneEmoji = (
  emoji: Emoji[],
  components: Subgroup[],
): Emoji[] => {
  const skinTones = flattenEmoji(components, 'skin-tone')
  const hairStyles = flattenEmoji(components, 'hair-style')

  return emoji
    .map((base) => {
      const hairStyle = hairStyles.find((hairStyle) =>
        base.emoji.endsWith(hairStyle)
      )

      const skinToneVariations = emoji
        .filter((compare) =>
          filterSkinToneVariations(base, compare, skinTones, hairStyle)
        )
        .map(({ emoji }) => emoji)

      return {
        ...base,
        skinTones: skinToneVariations.length > 0
          ? skinToneVariations
          : undefined,
      }
    })
    .filter((base) =>
      // Filter out all emoji with skin tone components
      !skinTones.some((skinTone) => base.emoji.includes(skinTone))
    )
}

export const parseComponents = ({ components, groups }: Data): Group[] =>
  groups.map((group) => ({
    ...group,
    subgroups: group.subgroups.map((subgroup) => ({
      ...subgroup,
      emoji: parseSkinToneEmoji(subgroup.emoji, components),
    })),
  }))
