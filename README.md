# TiptapCompare

A Tiptap extension that provides real-time visual comparison between two versions of content in your editor. This plugin helps you track changes by highlighting additions, modifications, and deletions with different colors and styles.

## Features

- Visual diff highlighting for tiptap editor changes changes
- Support for different types of blocks (text, paragraphs, images)
- Color-coded changes:
  - Green background for added content
  - Red background with strikethrough for removed content
  - Yellow background for modified content
- Real-time comparison updates
- Support for nested content structures

## Installation

```bash
npm install @samemichaeltadele/tiptap-compare
```

## Usage

```typescript
import { ComparePlugin } from 'tiptap-compare'
import { Editor } from '@tiptap/core'

const editor = new Editor({
  extensions: [
    // ... other extensions
    ComparePlugin.configure({
      comparisonContent: ""
    })
  ]
})

// Update comparison content
editor.commands.setComparisonContent(newContent)
```

## Configuration

The plugin accepts the following options:

- `comparisonContent`: The content to compare against (default: empty string), should be the content with which it should be compared in json format. 


## Styling

The plugin uses the following CSS classes for styling:

- `diff-added`: Applied to added content (green background)
- `diff-removed`: Applied to removed content (red background with strikethrough)
- `diff-modified`: Applied to modified content (yellow background)

## License

MIT

## Author

SameC137 <samemichael1415@gmail.com>