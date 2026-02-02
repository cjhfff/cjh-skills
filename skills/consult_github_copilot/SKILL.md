# Skill: Consult_GitHub_Copilot

**Purpose:** Open GitHub Copilot and facilitate human-AI collaboration for code assistance

**Mode:** Semi-automated (Human-in-the-loop interaction)

**Created:** 2026-02-02
**Author:** Yang Yue's Assistant

---

## Configuration

```yaml
skill:
  name: Consult_GitHub_Copilot
  description: |
    Opens GitHub Copilot interface, prompts user for input on complex questions,
    then reads and returns Copilot's response.
  target: host  # Critical: Use host browser to avoid Sandbox errors
```

## Workflow

### Step 1: Navigation
**Agent Action:** Navigate to GitHub Copilot
```yaml
- action: navigate
  targetUrl: https://github.com/copilot
  target: host
```

### Step 2: Focus Input
**Agent Action:** Attempt to locate and focus the chat input box
```yaml
- action: snapshot
  refs: aria  # Use aria references for stable element targeting
```

### Step 3: Human Input (Human-in-the-loop)
**Interaction:** Pause and prompt user
```yaml
- message: |
    🤖 Copilot is ready!
    
    Please type your question in the input box and press Enter.
    
    When done, tell me "Continue" and I'll read Copilot's response.
```

### Step 4: Read Response
**Agent Action:** Capture and return Copilot's reply
```yaml
- action: snapshot
  target: host
- action: read_response
  format: markdown
```

---

## Technical Notes

### Why Semi-automated?
Direct text injection fails on modern rich text editors (React/Vue-based) due to:
- Internal state management (doesn't read DOM values)
- Event-driven input handling
- Contenteditable divs instead of native inputs

### Solution: Human-in-the-loop
By design, this Skill:
1. Opens the browser
2. Prepares the interface
3. Hands control to user for input (bypasses technical limitations)
4. Reads and processes Copilot's response automatically

### Target: Host
Setting `target: host` ensures:
- Direct browser control (Chrome extension relay)
- No Sandbox dependency errors
- Access to the currently authenticated session

---

## Usage Example

```bash
# Invoke the skill
openclaw agents run --skill Consult_GitHub_Copilot
```

**Expected User Interaction:**
1. Agent opens Copilot in browser
2. User sees: "Please type your question..."
3. User types question and presses Enter
4. Agent reads Copilot's answer
5. Agent summarizes the response

---

## Tags

`browser`, `copilot`, `github`, `semi-automated`, `human-in-the-loop`, `code-assistance`, `ai-chat`

---

## Troubleshooting

**Issue:** "Sandbox browser unavailable"
**Fix:** Ensure `target: host` in config

**Issue:** Cannot type in input box
**Cause:** Rich text editor limitations
**Workaround:** This Skill is designed to handle this by involving the user

**Issue:** Cannot read response
**Fix:** Check page loaded correctly, try snapshot again
