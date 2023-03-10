import { write } from './write.ts'

type Emoji = {
  emoji: string
  name: string
  alt?: string[]
  skinTones?: string[]
}

type Subgroup = {
  subgroup: string // Subgroup name
  emoji: Emoji[]
}

export type Group = {
  group: string
  subgroups: Subgroup[]
}

export type Data = {
  groups: Group[]
  components: Subgroup[]
}

const zeroWidthJoiner = '‍'

const stringToUTF8Bytes = (str: string) => new TextEncoder().encode(str)

const groupRegex = /# group: ?(?<group>.*?)$/
const subgroupRegex = /# subgroup: ?(?<subgroup>.*?)$/
const emojiRegex = /; (?<status>[a-z-]*).*# (?<emoji>[^ ]*) [^ ]* (?<name>.*)$/

const url = 'https://unicode.org/Public/emoji/latest/emoji-test.txt'

const parseComponent = (acc: Data, subgroup: string, emoji: Emoji): Data => {
  const s = acc.components.find((component) => component.subgroup === subgroup)
  if (s) {
    s.emoji.push(emoji)
  } else {
    acc.components.push({ subgroup, emoji: [emoji] })
  }
  return acc
}

const parseEmoji = (acc: Data, line: string) => {
  const group = acc.groups[acc.groups.length - 1]
  const { status, emoji, name } = emojiRegex.exec(line)?.groups ?? {}

  if (status === 'fully-qualified') {
    group.subgroups[group.subgroups.length - 1].emoji.push({ emoji, name })
  } else if (status === 'unqualified' || status === 'minimally-qualified') {
    const subgroup = group.subgroups[group.subgroups.length - 1]
    const previous = subgroup.emoji[subgroup.emoji.length - 1]

    previous.alt = previous.alt ? [...previous.alt, emoji] : [emoji]
  } else if (status === 'component') {
    parseComponent(acc, group.subgroups[group.subgroups.length - 1].subgroup, {
      emoji,
      name,
    })
  }
}

const parseSubgroups = (acc: Data, line: string): Data => {
  const group = acc.groups[acc.groups.length - 1]
  const subgroup = subgroupRegex.exec(line)?.groups?.subgroup

  if (subgroup) {
    group.subgroups.push({ subgroup, emoji: [] })
  } else if (group.subgroups.length > 0) {
    parseEmoji(acc, line)
  } else {
    throw new Error('Group should always be followed by subgroup first')
  }

  return acc
}

const parseGroups = (acc: Data, line: string): Data => {
  const group = groupRegex.exec(line)?.groups?.group

  if (group) {
    acc.groups.push({ group, subgroups: [] })
  } else if (acc.groups.length > 0) {
    return parseSubgroups(acc, line)
  }
  return acc
}

// This is only to filter away 'Component' which contains no 'fully-qualified' emoji
const filterGroupsWithoutEmoji = ({ components, groups }: Data): Data => ({
  groups: groups.filter(({ subgroups }) =>
    subgroups.some(({ emoji }) => emoji.length > 0)
  ),
  components,
})

const emojiCount = ({ groups }: Data) =>
  groups.reduce(
    (acc, value) =>
      value.subgroups.reduce((acc, { emoji }) => emoji.length + acc, 0) + acc,
    0,
  )

const filterSkinToneVariantsEmoji = (
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

const filterSkinToneVariants = ({ components, groups }: Data): Group[] => {
  return groups.map((group) => ({
    ...group,
    subgroups: group.subgroups.map((subgroup) => ({
      ...subgroup,
      emoji: filterSkinToneVariantsEmoji(
        subgroup.emoji,
        components,
      ),
    })),
  }))
}

const groups = await fetch(url)
  .then((result) => result.text())
  .then((text) => text.split(/\r?\n/))
  .then((lines) => lines.filter((line) => line.trim() !== ''))
  .then((lines) => lines.reduce(parseGroups, { groups: [], components: [] }))
  .then(filterGroupsWithoutEmoji)
  .then((data) => {
    console.log(
      `Number of 'fully-qualified' emoji: ${
        emojiCount(data)
      } before filtering skin tone variants`,
    )
    return data
  })
  .then(filterSkinToneVariants)

await write(groups)
