#!/usr/bin/env python3
"""
快速测试 Gemini API 密钥可用的关键模型
"""

import subprocess
import json

API_KEY = "AIzaSyD8WVZQLUYNs0mk6KtFmcOVd6_owRU9TGg"

def quick_test():
    print("🚀 快速测试 Gemini API 密钥")
    print(f"🔑 API 密钥: {API_KEY[:10]}...{API_KEY[-4:]}")
    print("=" * 60)
    
    # 测试的关键模型
    models_to_test = [
        {"name": "gemini-2.5-pro", "display": "Gemini 2.5 Pro"},
        {"name": "gemini-2.5-flash", "display": "Gemini 2.5 Flash"},
        {"name": "gemini-2.0-flash", "display": "Gemini 2.0 Flash"},
        {"name": "gemini-2.0-flash-lite", "display": "Gemini 2.0 Flash Lite"},
        {"name": "gemini-2.5-pro-exp-03-25", "display": "Gemini 2.5 Pro Experimental"},
        {"name": "gemini-2.5-flash-exp-03-25", "display": "Gemini 2.5 Flash Experimental"},
    ]
    
    results = []
    
    for model in models_to_test:
        print(f"\n🧪 测试: {model['display']}")
        
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model['name']}:generateContent?key={API_KEY}"
        
        # 简单的请求数据
        data = {
            "contents": [{
                "parts": [{"text": "Say hello and tell me your model name."}]
            }]
        }
        
        # 使用 Python 的 requests 风格
        import tempfile
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            json.dump(data, f)
            temp_file = f.name
        
        try:
            cmd = [
                "curl", "-s", "-X", "POST",
                "-H", "Content-Type: application/json",
                "-d", f"@{temp_file}",
                url
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
            
            if result.returncode == 0:
                try:
                    response = json.loads(result.stdout)
                    if "candidates" in response:
                        text = response["candidates"][0]["content"]["parts"][0]["text"]
                        print(f"   ✅ 成功! {text[:60]}...")
                        results.append({"model": model['name'], "status": "✅", "response": text})
                    else:
                        error = response.get('error', {}).get('message', 'Unknown')
                        print(f"   ❌ 错误: {error[:60]}")
                        results.append({"model": model['name'], "status": "❌", "response": error})
                except:
                    print(f"   ❌ 响应解析失败")
                    results.append({"model": model['name'], "status": "❌", "response": "Parse error"})
            else:
                print(f"   ❌ 请求失败")
                results.append({"model": model['name'], "status": "❌", "response": "Request failed"})
                
        except subprocess.TimeoutExpired:
            print("   ⏰ 超时")
            results.append({"model": model['name'], "status": "⏰", "response": "Timeout"})
        except Exception as e:
            print(f"   ❌ 异常: {str(e)[:50]}")
            results.append({"model": model['name'], "status": "❌", "response": str(e)})
        finally:
            import os
            if os.path.exists(temp_file):
                os.unlink(temp_file)
    
    # 总结
    print("\n" + "=" * 60)
    print("📊 测试结果总结")
    print("=" * 60)
    
    successful = [r for r in results if r["status"] == "✅"]
    
    if successful:
        print(f"🎉 你的 API 密钥可以调用 {len(successful)} 个模型:")
        for result in successful:
            print(f"  • {result['model']} - {result['response'][:50]}...")
        
        print("\n🌟 推荐模型:")
        for result in successful:
            if "2.5-pro" in result["model"]:
                print(f"  🥇 {result['model']} - 最强大的专业模型")
            elif "2.5-flash" in result["model"]:
                print(f"  🥈 {result['model']} - 快速且功能强大")
            elif "2.0-flash" in result["model"]:
                print(f"  🥉 {result['model']} - 稳定可靠")
    else:
        print("❌ 没有模型测试成功，可能:")
        print("  1. API 密钥无效")
        print("  2. 网络问题")
        print("  3. API 服务不可用")
    
    print("\n🔧 使用建议:")
    print("在你的自定义脚本中指定模型:")
    print(f"""# gemini-advanced.sh 修改
MODEL="gemini-2.5-pro"  # 改为你想要的模型
API_KEY="{API_KEY}"

curl -X POST \\
  -H "Content-Type: application/json" \\
  -d '{{"contents":[{{"parts":[{{"text":"$1"}}]}}]}}' \\
  "https://generativelanguage.googleapis.com/v1beta/models/$MODEL:generateContent?key=$API_KEY"
""")

if __name__ == "__main__":
    quick_test()