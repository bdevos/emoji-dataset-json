import { Data } from './parse.ts'

export const emojiCount = ({ groups }: Data) =>
  groups.reduce(
    (groupAcc, { subgroups }) =>
      subgroups.reduce(
        (subgroupAcc, { emoji }) => emoji.length + subgroupAcc,
        0,
      ) + groupAcc,
    0,
  )
