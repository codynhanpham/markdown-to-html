# A list of some demonstrations

Some pages in this list use some additional custom CSS and JS. This script can be extremely flexible if you spend some time to customize it ~

- This README.md itself: [https://codynhanpham.com/markdown-to-html/demo/README.html](https://codynhanpham.com/markdown-to-html/demo/README.html)
- A resume preset: [Markdown](https://codynhanpham.com/resume/index.md) | [HTML](https://codynhanpham.com/resume/)
- A blog post: [Markdown](https://codynhanpham.com/blogs/iwannaburymypastself/if-care-equals-infinity/index.md) | [HTML](https://codynhanpham.com/blogs/iwannaburymypastself/if-care-equals-infinity/index.html)
- Figure and Tables support: [Markdown](https://codynhanpham.com/markdown-to-html/demo/figure.md) | [HTML](https://codynhanpham.com/markdown-to-html/demo/figure.html)

</br>

# Some highlights

### Code syntax highlighting

An excerpt from this converter's own source code:

```js
const optionDefinitions = [
    { name: 'input', alias: 'i', type: filename => new FileDetails(filename, "md"), multiple: true, defaultOption: true },
    { name: 'preset', alias: 'p', type: preset => new PresetOptions(preset), defaultValue: new PresetOptions("default") },
    { name: 'classmap', alias: 'c', type: filename => new FileDetails(filename, "json") },
]
const options = commandLineArgs(optionDefinitions);
```
---

### Custom class in markdown

```markdown
This is a normal paragraph.

[.center]This paragraph will have the `center` class and will be centered.
[.dim]**Only one special class at a time, though...**
```

This is a normal paragraph.

[.center]This paragraph will have the `center` class and will be centered.

[.dim]**Only one special class at a time, though...**

And because of this, for more complex styling, you can write a custom class map for the conversion. If you really really cannot make do with the custom class, you can always use inline HTML inside the markdown.

---

### Figure can be styled using the 1x2 table syntax

```markdown
​[.figure]
| ![Full-width or large image](../thumbnail_2x.png) |
|:--:|
| ***Figure 1.*** Full-width image. Large image will automatically be fitted into the container. |
```

[.figure]
| ![Full-width or large image](../thumbnail_2x.png) |
|:--:|
| ***Figure 1.*** Full-width image. Large image will automatically be fitted into the container. |


### Without the custom `.figure` class, tables are unaffected

```markdown
​[.center]***Table 1.*** Tables are unaffected and can be used normally.

| Header 1 | Header 2 | Header 3 |
|:--:|:--:|:--:|
| Unaffected | And | Can be used normally |
| Some Data | Or whatever | Content here |
```

[.center]***Table 1.*** Tables are unaffected and can be used normally.

| Header 1 | Header 2 | Header 3 |
|:--:|:--:|:--:|
| Unaffected | And | Can be used normally |
| Some Data | Or whatever | Content here |