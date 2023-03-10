# Emoji dataset JSON

tbd

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
