# Emoji dataset JSON

This repo contains some TypeScript code to parse the unicode emoji data into a simplyfied JSON file.

## Generate dataset

The parse task can be started with the following command.

```bash
deno task parse
```

## Format

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
