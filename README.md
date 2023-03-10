# Emoji dataset JSON

This repo contains TypeScript code to parse the [unicode emoji data](https://unicode.org/Public/emoji/latest/emoji-test.txt) into a simplyfied JSON file.

The generated [dataset](dataset/emoji.json) is relatively small (around 60KB).

| :warning: | I haven't had the time to properly check everything, so if you find any issues with the data, let me know |
| :-------: | :-------------------------------------------------------------------------------------------------------- |

## Generate dataset

The parse task can be started with the following command.

```bash
deno task parse
```

## Format

The format of the JSON file is quite minimal to keep the size overhead of the JSON format low.

Skin tone variations are removed as individual emoji and are added to the emoji that they belong to. The name of each emoji has been included to allow for search functionality.

The TypeScript definition of the output is:

```ts
type Output = {
  g: string; // Group name
  s: {
    s: string; // Subgroup name
    e: [
      string, // emoji character, name
      string // name
      string[]?, // skin tone variants
    ][];
  }[];
}[];
```

Example:

```json
[
  {
    "g": "Smileys & Emotion",
    "s": [
      {
        "s": "face-smiling",
        "e": [
          ["😀", "grinning face"],
          ["😃", "grinning face with big eyes"]
        ]
      }
    ],
    "g": "People & Body",
    "s": [
      {
        "s": "hand-fingers-open",
        "e": [
          ["👋", "waving hand", ["👋🏻", "👋🏼", "👋🏽", "👋🏾", "👋🏿"]],
          ["🤚", "raised back of hand", ["🤚🏻", "🤚🏼", "🤚🏽", "🤚🏾", "🤚🏿"]]
        ]
      }
    ]
  }
]
```
