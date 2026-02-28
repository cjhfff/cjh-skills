#!/bin/bash

# 高级 Gemini CLI 脚本
# 支持更多选项

API_KEY="AIzaSyD8WVZQLUYNs0mk6KtFmcOVd6_owRU9TGg"
BASE_URL="https://generativelanguage.googleapis.com/v1beta"
MODEL="gemini-2.0-flash"

# 解析参数
while [[ $# -gt 0 ]]; do
    case $1 in
        --model)
            MODEL="$2"
            shift 2
            ;;
        --json)
            OUTPUT_JSON=true
            shift
            ;;
        --help)
            echo "Gemini CLI - Google Gemini AI 命令行工具"
            echo "用法: $0 [选项] \"提示词\""
            echo ""
            echo "选项:"
            echo "  --model <模型名>   指定模型 (默认: gemini-2.0-flash)"
            echo "  --json             输出原始 JSON 响应"
            echo "  --help             显示帮助信息"
            echo ""
            echo "示例:"
            echo "  $0 \"解释量子计算\""
            echo "  $0 --model gemini-2.0-flash \"写一首诗\""
            exit 0
            ;;
        *)
            PROMPT="$1"
            shift
            ;;
    esac
done

if [ -z "$PROMPT" ]; then
    echo "错误: 需要提供提示词"
    echo "使用 $0 --help 查看帮助"
    exit 1
fi

# 调用 Gemini API
RESPONSE=$(curl -s -X POST \
  "${BASE_URL}/models/${MODEL}:generateContent?key=${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"contents\": [{
      \"parts\": [{
        \"text\": \"${PROMPT}\"
      }]
    }],
    \"generationConfig\": {
      \"temperature\": 0.7,
      \"topP\": 0.8,
      \"topK\": 40
    }
  }")

if [ "$OUTPUT_JSON" = true ]; then
    echo "$RESPONSE" | python3 -m json.tool
else
    echo "$RESPONSE" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    if 'candidates' in data and len(data['candidates']) > 0:
        text = data['candidates'][0]['content']['parts'][0]['text']
        print(text.strip())
    elif 'error' in data:
        print('API 错误:', data['error']['message'])
    else:
        print('未知响应:', json.dumps(data, indent=2))
except Exception as e:
    print('解析错误:', str(e))
    print('原始响应:', sys.stdin.read())
"
fi