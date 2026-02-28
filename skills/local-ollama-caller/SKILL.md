---
name: local-ollama-caller
description: Provides a standardized way to invoke local Ollama models for specific tasks. Use when a task is simple, creative, or when the user explicitly requests to use a local model to save costs or get a different perspective.
---

# Skill: Local Ollama Caller

This skill provides a clear and reliable method for invoking local Large Language Models (LLMs) managed by Ollama.

## When to Use This Skill

This skill should be triggered in the following scenarios:

1.  **Explicit User Request**: When the user directly asks to use "Ollama," "a local model," or a specific Ollama model name (e.g., "use qwen2.5 for this").
2.  **Simple & Creative Tasks**: For tasks that do not require complex tool use or deep reasoning, such as writing a short story, generating ideas, summarizing a simple text, or answering general knowledge questions.
3.  **Cost Efficiency**: When the primary model (e.g., Gemini Pro) is not necessary and a local model can perform the task adequately, thus saving on API costs.
4.  **Second Opinion**: When you need a different perspective or creative style for a task.

## How to Use This Skill

The primary tool for invoking a local Ollama model is `sessions_spawn`. This creates an isolated sub-agent session to handle the task.

### Procedure

1.  **Confirm Model Availability**: Before spawning, you can optionally verify the available models by checking the `models.json` configuration or using `session_status` to see currently configured models for the session. The most common local model available in this workspace is `ollama/qwen2.5:7b`.
2.  **Use `sessions_spawn`**: Call the `sessions_spawn` tool with the `task` and `model` parameters.

### Example Tool Calls

#### For Simple Text-Based Tasks

When the task is self-contained and doesn't involve reading a file, provide the full instructions directly.

**Example:**
```python
sessions_spawn(
  task="Write a short poem about a robot who discovers coffee.",
  model="ollama/qwen2.5:7b"
)
```

#### Preferred Method: For File-Based Tasks

To improve efficiency and save context space in the main session, **do not read the file content yourself**. Instead, instruct the sub-agent to read the file directly by providing the full file path in the task description.

**Example:**
```python
sessions_spawn(
  task="Please read the file at '~/Desktop/言情素材收集/05_高智商报复出轨.txt' and provide a summary.",
  model="ollama/qwen2.5:7b"
)
```
