# Skill: Project_Coder_Copilot

**Purpose:** Generate code using GitHub Copilot and automatically save it to local project

**Mode:** Automated (JavaScript injection + file extraction)

**Created:** 2026-02-02
**Author:** Yang Yue's Assistant

---

## Configuration

```yaml
skill:
  name: Project_Coder_Copilot
  description: |
    Generate code via GitHub Copilot using JavaScript injection to bypass input limitations.
    Automatically extracts generated code and saves it to local project directory.
  target: host  # Critical: Use host browser for clipboard/execCommand access
```

## Triggers

**Chinese:**
- "让 Copilot 写个 [xxx] 功能"
- "用 Copilot 生成 [xxx] 代码"
- "Copilot 帮我写个 [xxx]"

**English:**
- "Generate code for [xxx]"
- "Let Copilot write [xxx]"
- "Create [xxx] using Copilot"

---

## Workflow

### Step 1: Navigation
**Agent Action:** Open GitHub Copilot
```yaml
- action: navigate
  targetUrl: https://github.com/copilot
  target: host
```

### Step 2: Smart Input (JavaScript Injection)
**Agent Action:** Attempt to inject text using execCommand (bypasses React/Monaco limits)

```javascript
// JavaScript code to execute in browser context:
const userPrompt = "{{user_prompt}}";  // Replace with actual prompt

// Try multiple input methods
const input = document.querySelector('textarea') || 
              document.querySelector('[contenteditable="true"]') ||
              document.querySelector('.copilot-chat-input') ||
              document.querySelector('[data-testid="chat-input"]');

if (input) {
  input.focus();
  // Hack: execCommand bypasses React/Monaco input restrictions
  document.execCommand('insertText', false, userPrompt);
  'SUCCESS: Text injected via execCommand';
} else {
  'ERROR: Input element not found';
}
```

**If JS Injection Succeeds:**
```yaml
- action: click
  selector: "[aria-label='Send'],[data-testid='send-button'],button[type='submit']"
```

### Step 3: Result Polling (Smart Wait)
**Agent Action:** Wait for generation to complete
```yaml
- action: polling
  interval: 2s
  condition: |
    // Stop Generating button should disappear
    const stopBtn = document.querySelector('[aria-label="Stop generating"]');
    return stopBtn === null || stopBtn.offsetParent === null;
  timeout: 120s  # 2 minute max for code generation
```

### Step 4: Code Extraction & Save
**Agent Action:** Extract code and save to local project

```yaml
# Extract code block from page
- action: evaluate
  target: host
  script: |
    // Find the last generated code block
    const codeBlocks = document.querySelectorAll('pre code, [class*="code-block"]');
    const lastBlock = codeBlocks[codeBlocks.length - 1];
    
    if (lastBlock) {
      return {
        success: true,
        language: lastBlock.className.match(/language-(\w+)/)?.[1] || 'text',
        code: lastBlock.innerText
      };
    } else {
      // Try alternative: markdown code blocks
      const mdCode = document.querySelectorAll('```');
      if (mdCode.length > 0) {
        return {
          success: true,
          language: 'markdown',
          code: Array.from(mdCode).map(b => b.innerText).join('\n')
        };
      }
    }
    return { success: false, error: 'No code block found' };
```

**Save to file:**
```yaml
- action: write
  path: "{{project_dir}}/{{timestamp}}_{{feature_name}}.cpp"
  content: "{{extracted_code}}"
```

### Step 5: Report
**Agent Action:** Notify user
```yaml
- message: |
    ✅ **代码已生成并保存！**
    
    📁 文件: {{project_dir}}/{{timestamp}}_{{feature_name}}.cpp
    ⏱️ 耗时: {{generation_time}}s
    📊 行数: {{line_count}}
    
    代码已就绪，请查看文件。
```

---

## Fallback: Manual Input

If Step 2 (JS Injection) fails:

```yaml
- message: |
    ⚠️ 无法自动输入。
    
    **请手动操作：**
    1. 在 Copilot 输入框中粘贴问题："{{user_prompt}}"
    2. 按回车发送
    3. 等待代码生成完成
    4. 完成后告诉我 "Continue"
    
    我会自动提取并保存代码。
```

After user confirms:
```yaml
# Skip to Step 4 (Extraction & Save)
```

---

## Technical Notes

### Why execCommand Works:
1. `document.execCommand('insertText')` is a legacy API that bypasses modern framework input handling
2. Works on React/Vue/Monaco editors where `value = "text"` fails
3. Browser natively supports this command for clipboard operations

### Why Not Set Value Directly:
- Modern editors use virtual DOM state, not DOM values
- Setting `element.value` doesn't trigger React's onChange
- Monaco Editor (used by GitHub) has complex input handling

### Code Block Detection:
- Primary: `<pre><code>` elements
- Fallback: Markdown code blocks (```)
- Extracts the LAST generated code block

---

## Project Structure

Generated code is saved to:
```
{{project_dir}}/
  └── generated/
      └── YYYYMMDD_HHmmSS_feature-name.ext
```

Default project directory: Current workspace (`~/.openclaw/workspace`)

---

## Usage Example

**User says:**
> "让 Copilot 写个排序算法功能"

**Skill executes:**
1. Opens GitHub Copilot
2. Injects: "请帮我写一个高效的排序算法，要求：1. 时间复杂度 O(n log n) 2. 支持自定义比较函数 3. 有完整的注释 4. 包含测试用例"
3. Waits for code generation
4. Extracts code from response
5. Saves to `generated/20260202_134500_sorting_algorithm.cpp`
6. Reports success

---

## Tags

`copilot`, `code-generation`, `automation`, `javascript-injection`, `file-operations`, `host-target`, `project-tools`

---

## Troubleshooting

**Issue:** execCommand returns false
**Fix:** Try clicking input first, then execCommand

**Issue:** No code block found after generation
**Fix:** Wait longer or try scrolling to find the code

**Issue:** File save permission error
**Fix:** Check project directory exists, use workspace root

**Issue:** "Stop Generating" never disappears
**Fix:** Manual timeout after 2 minutes, prompt user to check manually
