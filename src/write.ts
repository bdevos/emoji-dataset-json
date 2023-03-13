import type { Emoji, Group } from './parse.ts'

type EmojiOutput = [
  string, // emoji character, name
  string, // name
  string[]?, // skin tone variants
]

type Output = {
  g: string // Group name
  e: EmojiOutput[]
}[]

const emojiOutput = ({ emoji, name, skinTones }: Emoji): EmojiOutput =>
  skinTones ? [emoji, name, skinTones] : [emoji, name]

const simplifyOutput = (groups: Group[]): Output =>
  groups.map(({ group, subgroups }) => ({
    g: group,
    e: subgroups.flatMap(({ emoji }) => emoji.map(emojiOutput)),
  }))

export const write = async (output: string, groups: Group[]) => {
  try {
    await Deno.writeTextFile(output, JSON.stringify(simplifyOutput(groups)), {
      create: true,
    })
    console.log(`File written to: ${output}`)
  } catch (e) {
    console.error(e)
  }
}
