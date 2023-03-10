import { write } from './write.ts'

type Emoji = {
  emoji: string
  name: string
  unqualified?: string[]
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

const groupRegex = /# group: ?(?<group>.*?)$/
const subgroupRegex = /# subgroup: ?(?<subgroup>.*?)$/
const emojiRegex = /; (?<status>[a-z-]*).*# (?<emoji>[^ ]*) [^ ]* (?<name>.*)$/

const url = 'https://unicode.org/Public/emoji/14.0/emoji-test.txt'

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
  } else if (status === 'unqualified') {
    const subgroup = group.subgroups[group.subgroups.length - 1]
    const previous = subgroup.emoji[subgroup.emoji.length - 1]

    previous.unqualified = previous.unqualified
      ? [...previous.unqualified, emoji]
      : [emoji]
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
  skinTones: Emoji[],
): Emoji[] => {
  // Find emoji that have an alternative without skin tone
  const emojiSkinToneVariants = emoji.filter(({ emoji, unqualified }) =>
    skinTones.some(({ emoji: skinTone }) =>
      emoji.includes(skinTone) ||
      unqualified?.some((bla) => bla.includes(skinTone))
    )
  ).map(({ emoji }) => emoji)

  if (emojiSkinToneVariants.length === 0) {
    return emoji
  }

  return emoji.map((base) => {
    const skinTones = emojiSkinToneVariants.filter((skinToneVariant) =>
      skinToneVariant.includes(base.emoji) ||
      base.unqualified?.some((unqualified) =>
        skinToneVariant.includes(unqualified)
      )
    )
    if (skinTones.length > 0) {
      return { ...base, skinTones }
    } else {
      return base
    }
  }).filter(({ emoji }) => !emojiSkinToneVariants.includes(emoji))
}

const filterSkinToneVariants = ({ components, groups }: Data): Group[] => {
  const skinTones = components.find(({ subgroup }) => subgroup === 'skin-tone')
    ?.emoji.map(({ name }) => name)

  if (!skinTones) {
    throw new Error('No skinTone components found')
  }

  return groups.map((group) => ({
    ...group,
    subgroups: group.subgroups.map((subgroup) => ({
      ...subgroup,
      emoji: filterSkinToneVariantsEmoji(
        subgroup.emoji,
        components.find(({ subgroup }) => subgroup === 'skin-tone')?.emoji ??
          [],
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
