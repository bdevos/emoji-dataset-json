import type { Group } from './parse.ts'

type Output = {
  g: string // Group name
  s: {
    s: string // Subgroup name
    e: [
      string, // emoji character, name
      string, // name
      string[]?, // skin tone variants
    ][]
  }[]
}[]

const simplifyOutput = (groups: Group[]): Output =>
  groups.map(({ group, subgroups }) => ({
    g: group,
    s: subgroups.map(({ subgroup, emoji }) => ({
      s: subgroup,
      e: emoji.map(({ emoji, name, skinTones }) =>
        skinTones ? [emoji, name, skinTones] : [emoji, name]
      ),
    })),
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
