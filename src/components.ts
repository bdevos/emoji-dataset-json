import type { Data, Emoji, Group, Subgroup } from './parse.ts'

const zeroWidthJoiner = '‍'

const parseSkinToneEmoji = (
  emoji: Emoji[],
  components: Subgroup[],
): Emoji[] => {
  const skinToneEmoji =
    components.find(({ subgroup }) => subgroup === 'skin-tone')?.emoji.map((
      { emoji },
    ) => emoji) ?? []
  const hairStyleEmoji =
    components.find(({ subgroup }) => subgroup === 'hair-style')?.emoji.map((
      { emoji },
    ) => emoji) ?? []

  return emoji
    .map((baseEmoji) => {
      const skinToneVersions = emoji.filter((compareEmoji) =>
        skinToneEmoji.some((skinTone) =>
          compareEmoji.emoji === baseEmoji.emoji + skinTone ||
          baseEmoji.alt?.some((alt) => compareEmoji.emoji === alt + skinTone)
        )
      ).map(({ emoji }) => emoji)

      return {
        ...baseEmoji,
        skinTones: skinToneVersions.length > 0 ? skinToneVersions : undefined,
      }
    })
    .map((baseEmoji) => {
      const hairStyle = hairStyleEmoji.find((hairStyle) =>
        baseEmoji.emoji.endsWith(hairStyle)
      )

      if (!hairStyle) {
        return baseEmoji
      }

      // REMARK: At the moment none of these hair style emoji have alt, so will skip that for brevety
      const skinToneVersions = emoji.filter((compareEmoji) =>
        skinToneEmoji.some((skinTone) =>
          compareEmoji.emoji ===
            baseEmoji.emoji.replace(hairStyle, '').replace(
                zeroWidthJoiner,
                '',
              ) + skinTone + zeroWidthJoiner + hairStyle
        )
      ).map(({ emoji }) => emoji)

      return {
        ...baseEmoji,
        skinTones: skinToneVersions.length > 0 ? skinToneVersions : undefined,
      }
    })
    .filter((baseEmoji) =>
      !skinToneEmoji.some((skinTone) => baseEmoji.emoji.includes(skinTone))
    )
}

export const parseSkinTones = (
  { components, groups }: Data,
): Group[] =>
  groups.map((group) => ({
    ...group,
    subgroups: group.subgroups.map((subgroup) => ({
      ...subgroup,
      emoji: parseSkinToneEmoji(
        subgroup.emoji,
        components,
      ),
    })),
  }))
