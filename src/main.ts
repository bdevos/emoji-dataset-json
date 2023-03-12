import { parseSkinTones } from './components.ts'
import { emojiCount } from './count.ts'
import { filterGroupsWithoutEmoji } from './filter.ts'
import { parseLines } from './parse.ts'
import { write } from './write.ts'

const url = 'https://unicode.org/Public/emoji/latest/emoji-test.txt'

await fetch(url)
  .then((result) => result.text())
  .then((text) => text.split(/\r?\n/))
  .then((lines) => lines.filter((line) => line.trim() !== ''))
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
  .then(parseSkinTones)
  .then(write)
