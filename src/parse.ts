import { filterGroupsWithoutEmoji } from './filter.ts'
import { matchEmoji, matchGroup, matchSubgroup } from './match.ts'

export type Emoji = {
  emoji: string
  name: string
  alt?: string[]
  skinTones?: string[]
}

export type Subgroup = {
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

const parseComponent = (data: Data, subgroup: string, emoji: Emoji): Data => {
  const s = data.components.find((component) => component.subgroup === subgroup)
  if (s) {
    s.emoji.push(emoji)
  } else {
    data.components.push({ subgroup, emoji: [emoji] })
  }
  return data
}

const parseEmoji = (data: Data, line: string) => {
  const group = data.groups[data.groups.length - 1]
  const { status, emoji, name } = matchEmoji(line)

  if (status === 'fully-qualified') {
    group.subgroups[group.subgroups.length - 1].emoji.push({ emoji, name })
  } else if (status === 'unqualified' || status === 'minimally-qualified') {
    const subgroup = group.subgroups[group.subgroups.length - 1]
    const previous = subgroup.emoji[subgroup.emoji.length - 1]

    previous.alt = previous.alt ? [...previous.alt, emoji] : [emoji]
  } else if (status === 'component') {
    parseComponent(data, group.subgroups[group.subgroups.length - 1].subgroup, {
      emoji,
      name,
    })
  }
}

const parseSubgroups = (data: Data, line: string): Data => {
  const group = data.groups[data.groups.length - 1]
  const subgroup = matchSubgroup(line)

  if (subgroup) {
    group.subgroups.push({ subgroup, emoji: [] })
  } else if (group.subgroups.length > 0) {
    parseEmoji(data, line)
  } else {
    throw new Error('Group should always be followed by subgroup first')
  }

  return data
}

const parseGroups = (data: Data, line: string): Data => {
  const group = matchGroup(line)

  if (group) {
    data.groups.push({ group, subgroups: [] })
  } else if (data.groups.length > 0) {
    return parseSubgroups(data, line)
  }
  return data
}

export const splitLines = (text: string): string[] =>
  text
    .split(/\r?\n/)
    .filter((line) => line.trim() !== '')

export const parseLines = (lines: string[]): Data =>
  filterGroupsWithoutEmoji(
    lines.reduce(parseGroups, { groups: [], components: [] }),
  )
