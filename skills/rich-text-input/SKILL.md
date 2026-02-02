# Skill: Rich Text Input Handler

**Purpose:** Handle text input in complex rich text editors (like GitHub Copilot's chat input)

**Problem:** Direct HTML value injection (`element.value = "text"`) doesn't work on modern rich text editors because they use:
- Virtual DOM frameworks (React, Vue, etc.)
- Custom state management
- Event-driven input handling
- Contenteditable divs instead of `<input>` elements

**Solution:** Use simulated keyboard events (Keystroke Simulation)

## Usage

```bash
# In browser automation, use this pattern:
# 1. Click to focus the input element
# 2. Type character by character using keyboard simulation
```

## Implementation

### Wrong Approach (Fails):
```javascript
// This WON'T work on rich text editors
document.querySelector('[contenteditable]').value = "Hello";
document.querySelector('textarea').value = "Hello";
element.setAttribute('value', 'Hello');
```

### Correct Approach:
```javascript
// Click to focus first
element.click();

// Then simulate keyboard events
const text = "Hello Copilot!";
for (const char of text) {
  const event = new KeyboardEvent('keydown', {
    key: char,
    code: `Key${char.toUpperCase()}`,
    bubbles: true
  });
  element.dispatchEvent(event);
}
```

## When to Use This Skill

- GitHub Copilot chat input
- Rich text editors (Notion, Confluence, etc.)
- Modern web apps with custom input components
- Any `<div contenteditable>` elements
- Textareas with React/Vue state management

## Technical Notes

### Why Set Value Fails:
1. **React/Vue state**: Modern frameworks don't read DOM values directly. They track state internally.
2. **Synthetic events**: Input libraries dispatch custom events that frameworks listen to.
3. **Virtual cursors**: Rich editors maintain cursor position in separate data structures.

### Why Keystrokes Work:
1. **Native events**: Keyboard events trigger framework event listeners
2. **State updates**: Framework detects `keydown`/`input` events and updates state
3. **DOM sync**: State changes then reflect in the DOM

## Best Practices

1. Always try **Click + Keyboard** pattern first for text input
2. If clicking fails, try `element.focus()`
3. For special keys (Enter, Tab), dispatch specific `key` values
4. Add small delays between keystrokes (10-50ms) if needed
5. Verify input by checking visible text content

## Alternative: Direct Skill Execution

If browser automation fails entirely, create a new session with this context and continue the conversation directly.

---

**Created:** 2026-02-02
**Author:** Yang Yue's Assistant
**Tags:** browser, automation, input, rich-text, copilot
