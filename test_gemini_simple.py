#!/usr/bin/env python3
"""
简单测试 Gemini API 密钥
"""

import subprocess
import sys
import json

# 你的 API 密钥
API_KEY = "AIzaSyD8WVZQLUYNs0mk6KtFmcOVd6_owRU9TGg"

def install_library():
    """安装必要的库"""
    print("🔧 安装 google-generativeai 库...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "google-generativeai", "-q"])
        print("✅ 库安装成功")
        return True
    except Exception as e:
        print(f"❌ 库安装失败: {e}")
        return False

def test_with_curl():
    """使用 curl 测试 API"""
    print("\n🌐 使用 curl 测试 Gemini API...")
    
    # 测试端点
    endpoints = [
        {
            "name": "gemini-1.5-flash",
            "url": f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={API_KEY}"
        },
        {
            "name": "gemini-1.5-pro", 
            "url": f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key={API_KEY}"
        },
        {
            "name": "gemini-2.0-flash",
            "url": f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}"
        }
    ]
    
    for endpoint in endpoints:
        print(f"\n测试模型: {endpoint['name']}")
        print(f"URL: {endpoint['url'][:80]}...")
        
        # 创建请求数据
        request_data = {
            "contents": [{
                "parts": [{
                    "text": "Hello, what is 2+2? Answer briefly."
                }]
            }]
        }
        
        # 写入临时文件
        import tempfile
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            json.dump(request_data, f)
            temp_file = f.name
        
        try:
            # 执行 curl 请求
            cmd = [
                "curl", "-s", "-X", "POST",
                "-H", "Content-Type: application/json",
                "-d", f"@{temp_file}",
                endpoint['url']
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
            
            if result.returncode == 0:
                response = json.loads(result.stdout)
                if "candidates" in response:
                    text = response["candidates"][0]["content"]["parts"][0]["text"]
                    print(f"✅ 成功! 响应: {text[:50]}...")
                    
                    # 检查使用量
                    if "usageMetadata" in response:
                        usage = response["usageMetadata"]
                        print(f"   📊 令牌使用: {usage.get('promptTokenCount', 'N/A')} 输入, {usage.get('candidatesTokenCount', 'N/A')} 输出")
                else:
                    print(f"❌ API 错误: {response.get('error', {}).get('message', 'Unknown error')}")
            else:
                print(f"❌ curl 错误: {result.stderr[:100]}")
                
        except subprocess.TimeoutExpired:
            print("⏰ 请求超时")
        except json.JSONDecodeError:
            print(f"❌ JSON 解析错误: {result.stdout[:100]}")
        except Exception as e:
            print(f"❌ 其他错误: {str(e)}")
        finally:
            # 清理临时文件
            import os
            if os.path.exists(temp_file):
                os.unlink(temp_file)

def test_available_models():
    """测试可用的模型列表"""
    print("\n📋 获取可用模型列表...")
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={API_KEY}"
    
    try:
        cmd = ["curl", "-s", "-X", "GET", url]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        
        if result.returncode == 0:
            response = json.loads(result.stdout)
            if "models" in response:
                models = response["models"]
                print(f"🎯 找到 {len(models)} 个模型:")
                
                # 过滤和显示 Gemini 模型
                gemini_models = []
                for model in models:
                    if 'gemini' in model.get('name', '').lower():
                        gemini_models.append(model)
                
                print(f"\n📦 其中 {len(gemini_models)} 个是 Gemini 模型:")
                for model in gemini_models[:10]:  # 显示前10个
                    name = model.get('name', 'Unknown')
                    display_name = model.get('displayName', 'N/A')
                    version = model.get('version', 'N/A')
                    print(f"  • {display_name} ({name}) - v{version}")
                
                if len(gemini_models) > 10:
                    print(f"  ... 还有 {len(gemini_models) - 10} 个模型")
            else:
                print(f"❌ 响应格式错误: {response.get('error', {}).get('message', 'Unknown')}")
        else:
            print(f"❌ 请求失败: {result.stderr[:100]}")
            
    except Exception as e:
        print(f"❌ 错误: {str(e)}")

def main():
    print("=" * 60)
    print("🔍 测试 Gemini API 密钥模型可用性")
    print(f"🔑 API 密钥: {API_KEY[:10]}...{API_KEY[-4:]}")
    print("=" * 60)
    
    # 检查 curl 是否可用
    try:
        subprocess.run(["curl", "--version"], capture_output=True, check=True)
        print("✅ curl 可用")
    except:
        print("❌ curl 不可用，无法测试")
        return
    
    # 测试可用模型
    test_available_models()
    
    # 测试具体模型
    test_with_curl()
    
    print("\n" + "=" * 60)
    print("🎉 测试完成!")
    print("\n💡 建议:")
    print("1. 如果所有测试都失败，可能是 API 密钥无效")
    print("2. 如果部分成功，说明密钥有效但某些模型不可用")
    print("3. 如果显示限额错误，需要等待或升级配额")

if __name__ == "__main__":
    main()