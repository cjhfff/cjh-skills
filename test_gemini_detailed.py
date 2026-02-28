#!/usr/bin/env python3
"""
详细测试 Gemini API 密钥可用的模型
"""

import subprocess
import json
import time

API_KEY = "AIzaSyD8WVZQLUYNs0mk6KtFmcOVd6_owRU9TGg"

def get_available_models():
    """获取所有可用模型"""
    print("📋 获取所有可用模型...")
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={API_KEY}"
    
    try:
        cmd = ["curl", "-s", "-X", "GET", url]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
        
        if result.returncode == 0:
            return json.loads(result.stdout)
        else:
            print(f"❌ 获取模型列表失败: {result.stderr[:100]}")
            return None
    except Exception as e:
        print(f"❌ 错误: {str(e)}")
        return None

def test_model(model_name, display_name):
    """测试单个模型"""
    print(f"\n🧪 测试: {display_name}")
    print(f"   模型: {model_name}")
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={API_KEY}"
    
    request_data = {
        "contents": [{
            "parts": [{
                "text": "Hello! What is 2+2? Please answer briefly in one sentence."
            }]
        }],
        "generationConfig": {
            "maxOutputTokens": 50
        }
    }
    
    import tempfile
    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
        json.dump(request_data, f)
        temp_file = f.name
    
    try:
        cmd = [
            "curl", "-s", "-X", "POST",
            "-H", "Content-Type: application/json",
            "-d", f"@{temp_file}",
            url
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
        
        if result.returncode == 0:
            response = json.loads(result.stdout)
            
            if "candidates" in response:
                text = response["candidates"][0]["content"]["parts"][0]["text"]
                print(f"   ✅ 成功! 响应: {text.strip()}")
                
                if "usageMetadata" in response:
                    usage = response["usageMetadata"]
                    print(f"   📊 令牌: {usage.get('promptTokenCount', 'N/A')} 输入, {usage.get('candidatesTokenCount', 'N/A')} 输出")
                
                return True, text
            else:
                error_msg = response.get('error', {}).get('message', 'Unknown error')
                print(f"   ❌ API 错误: {error_msg[:80]}")
                return False, error_msg
        else:
            print(f"   ❌ 请求失败: {result.stderr[:100]}")
            return False, result.stderr
            
    except subprocess.TimeoutExpired:
        print("   ⏰ 请求超时")
        return False, "Timeout"
    except json.JSONDecodeError:
        print(f"   ❌ JSON 解析错误")
        return False, "JSON decode error"
    except Exception as e:
        print(f"   ❌ 其他错误: {str(e)[:80]}")
        return False, str(e)
    finally:
        import os
        if os.path.exists(temp_file):
            os.unlink(temp_file)

def main():
    print("=" * 70)
    print("🔍 Gemini API 密钥详细模型测试")
    print(f"🔑 API 密钥: {API_KEY[:10]}...{API_KEY[-4:]}")
    print("=" * 70)
    
    # 获取所有模型
    models_data = get_available_models()
    if not models_data or "models" not in models_data:
        print("❌ 无法获取模型列表")
        return
    
    models = models_data["models"]
    print(f"🎯 总共找到 {len(models)} 个模型")
    
    # 过滤 Gemini 模型
    gemini_models = []
    for model in models:
        name = model.get('name', '')
        if 'gemini' in name.lower() and 'generateContent' in model.get('supportedGenerationMethods', []):
            gemini_models.append({
                'name': name.replace('models/', ''),
                'display_name': model.get('displayName', 'Unknown'),
                'version': model.get('version', 'N/A'),
                'description': model.get('description', '')
            })
    
    print(f"\n📦 可用的 Gemini 生成模型: {len(gemini_models)} 个")
    print("-" * 70)
    
    # 按版本和类型分组
    model_groups = {}
    for model in gemini_models:
        name = model['name']
        if '2.5' in name:
            group = '2.5系列'
        elif '2.0' in name:
            group = '2.0系列'
        elif '1.5' in name:
            group = '1.5系列'
        elif 'exp' in name or 'preview' in name:
            group = '实验版'
        else:
            group = '其他'
        
        if group not in model_groups:
            model_groups[group] = []
        model_groups[group].append(model)
    
    # 显示分组
    for group, models_in_group in model_groups.items():
        print(f"\n📁 {group} ({len(models_in_group)}个模型):")
        for model in models_in_group:
            print(f"  • {model['display_name']} ({model['name']})")
    
    print("\n" + "=" * 70)
    print("🧪 开始测试关键模型...")
    print("=" * 70)
    
    # 测试关键模型
    key_models = [
        {"name": "gemini-2.5-pro", "display": "Gemini 2.5 Pro"},
        {"name": "gemini-2.5-flash", "display": "Gemini 2.5 Flash"},
        {"name": "gemini-2.0-flash", "display": "Gemini 2.0 Flash"},
        {"name": "gemini-2.0-flash-lite", "display": "Gemini 2.0 Flash Lite"},
        {"name": "gemini-2.5-pro-preview-tts", "display": "Gemini 2.5 Pro TTS Preview"},
        {"name": "gemini-2.5-flash-preview-tts", "display": "Gemini 2.5 Flash TTS Preview"},
    ]
    
    results = []
    for model_info in key_models:
        success, response = test_model(model_info["name"], model_info["display"])
        results.append({
            "model": model_info["name"],
            "display": model_info["display"],
            "success": success,
            "response": response[:100] if success else response
        })
        time.sleep(1)  # 避免速率限制
    
    print("\n" + "=" * 70)
    print("📊 测试结果总结")
    print("=" * 70)
    
    successful = [r for r in results if r["success"]]
    failed = [r for r in results if not r["success"]]
    
    print(f"✅ 成功的模型: {len(successful)}/{len(results)}")
    for result in successful:
        print(f"  • {result['display']}: {result['response'][:50]}...")
    
    if failed:
        print(f"\n❌ 失败的模型: {len(failed)}/{len(results)}")
        for result in failed:
            print(f"  • {result['display']}: {result['response'][:80]}")
    
    print("\n" + "=" * 70)
    print("🎯 你的 API 密钥可用的最佳模型:")
    print("=" * 70)
    
    # 推荐最佳模型
    if successful:
        print("🌟 推荐使用:")
        for result in successful:
            if "2.5-pro" in result["model"]:
                print(f"  🥇 {result['display']} - 最强大的模型")
            elif "2.5-flash" in result["model"]:
                print(f"  🥈 {result['display']} - 快速且强大的平衡选择")
            elif "2.0-flash" in result["model"]:
                print(f"  🥉 {result['display']} - 稳定可靠的模型")
    
    print("\n💡 使用建议:")
    print("1. 对于复杂任务: 使用 Gemini 2.5 Pro")
    print("2. 对于日常使用: 使用 Gemini 2.5 Flash")
    print("3. 对于简单任务: 使用 Gemini 2.0 Flash")
    print("4. 对于语音任务: 使用 TTS 预览模型")
    
    print("\n🔧 在你的自定义脚本中，可以这样指定模型:")
    print(f"""# 在 gemini-advanced.sh 中添加模型参数
MODEL="gemini-2.5-pro"  # 或 gemini-2.5-flash, gemini-2.0-flash
curl -X POST \\
  -H "Content-Type: application/json" \\
  -d '{{"contents":[{{"parts":[{{"text":"$PROMPT"}}]}}]}}' \\
  "https://generativelanguage.googleapis.com/v1beta/models/$MODEL:generateContent?key=$API_KEY"
""")

if __name__ == "__main__":
    main()