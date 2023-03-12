import { parseComponents } from './components.ts'
import { emojiCount } from './count.ts'
import { filterGroupsWithoutEmoji } from './filter.ts'
import { parseLines, splitLines } from './parse.ts'
import { write } from './write.ts'

const url = 'https://unicode.org/Public/emoji/latest/emoji-test.txt'
const output = 'dataset/emoji.json'

await fetch(url)
  .then((result) => result.text())
  .then(splitLines)
  .then(parseLines)
  .then(filterGroupsWithoutEmoji)
  .then((data) => {
    console.log(
      `Number of 'fully-qualified' emoji: ${
        emojiCount(data)
      } before filtering skin tone variants`,
    )
    return data
  })
  .then(parseComponents)
  .then((groups) => write(output, groups))
