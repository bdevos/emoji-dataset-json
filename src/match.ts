const groupRegex = /# group: ?(?<group>.*?)$/
const subgroupRegex = /# subgroup: ?(?<subgroup>.*?)$/
const emojiRegex = /; (?<status>[a-z-]*).*# (?<emoji>[^ ]*) [^ ]* (?<name>.*)$/

export const matchGroup = (line: string) => groupRegex.exec(line)?.groups?.group

export const matchSubgroup = (line: string) =>
  subgroupRegex.exec(line)?.groups?.subgroup

export const matchEmoji = (line: string) => emojiRegex.exec(line)?.groups ?? {}
