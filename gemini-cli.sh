#!/bin/bash

# Gemini CLI 包装脚本
# 使用您的 API Key: AIzaSyD8WVZQLUYNs0mk6KtFmcOVd6_owRU9TGg

API_KEY="AIzaSyD8WVZQLUYNs0mk6KtFmcOVd6_owRU9TGg"
BASE_URL="https://generativelanguage.googleapis.com/v1beta"

# 检查是否提供了提示词
if [ $# -eq 0 ]; then
    echo "Usage: $0 \"Your prompt here\""
    echo "Example: $0 \"Explain quantum computing in simple terms\""
    exit 1
fi

PROMPT="$*"

# 调用 Gemini API
curl -s -X POST \
  "${BASE_URL}/models/gemini-2.0-flash:generateContent?key=${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"contents\": [{
      \"parts\": [{
        \"text\": \"${PROMPT}\"
      }]
    }]
  }" | python3 -c "
import json, sys
data = json.load(sys.stdin)
if 'candidates' in data and len(data['candidates']) > 0:
    text = data['candidates'][0]['content']['parts'][0]['text']
    print(text.strip())
else:
    print('Error:', json.dumps(data, indent=2))
"