# Markdown to custom HTML

A converter that takes markdown files and converts it to production-ready HTML for https://codynhanpham.com

> → A real world demo of this README.md itself: https://codynhanpham.com/markdown-to-html

#### **Back to GitHub:** https://github.com/codynhanpham/markdown-to-html

## Features
- Support class mapping that can select specific elements down the tree
- Custom class can be specified in the markdown file for specific elements
- Code syntax highlighting
- Custom CSS styling (of course)
- Customizable HTML templates
- Customizable presets

## Usage

See the code: [css](https://github.com/codynhanpham/markdown-to-html/tree/main/css/), [presets](https://github.com/codynhanpham/markdown-to-html/tree/main/presets/), and [index.js](https://github.com/codynhanpham/markdown-to-html/tree/main/index.js)

It's for my personal webpage, though it's pretty straightforward to use. The default preset should work just fine for most cases.

Simply clone the repo, then `npm install` and `node . [files ...] [options]` to run the converter.

#### `Files`: A sequence of markdown files to convert.

#### `Options`:
- `-p, --preset <preset>`: Use a preset. ***Default:*** `default`
- `-c, --classmap <classmap>`: Use a classmap. Must be a JSON file. If specified, this class map will override the class map in `preset`. See [presets/classMap/resume.json](https://github.com/codynhanpham/markdown-to-html/tree/main/presets/classMap/resume.json) for examples. ***Default:*** `default` (blank)

#### Example:
```bash
node . README.md -p default -c classmap.json
```