#!/usr/bin/env python3
"""
测试 Gemini API 密钥可用的模型
"""

import google.generativeai as genai
import os

# 你的 API 密钥
API_KEY = "AIzaSyD8WVZQLUYNs0mk6KtFmcOVd6_owRU9TGg"

def test_gemini_models():
    """测试可用的 Gemini 模型"""
    print("🔍 测试 Gemini API 密钥模型可用性")
    print(f"API 密钥: {API_KEY[:10]}...{API_KEY[-4:]}")
    print("-" * 50)
    
    try:
        # 配置 API 密钥
        genai.configure(api_key=API_KEY)
        print("✅ API 密钥配置成功")
        
        # 列出可用模型
        print("\n📋 正在获取可用模型列表...")
        models = genai.list_models()
        
        # 过滤 Gemini 模型
        gemini_models = []
        for model in models:
            if 'gemini' in model.name.lower():
                gemini_models.append(model)
        
        print(f"🎯 找到 {len(gemini_models)} 个 Gemini 模型:")
        print("-" * 50)
        
        for model in gemini_models:
            print(f"📦 模型名称: {model.name}")
            print(f"   📝 显示名称: {model.display_name}")
            print(f"   📊 版本: {model.version}")
            print(f"   📋 描述: {model.description[:100]}...")
            print(f"   ⚙️ 输入令牌限制: {model.input_token_limit}")
            print(f"   📤 输出令牌限制: {model.output_token_limit}")
            
            # 测试模型是否可用
            try:
                test_model = genai.GenerativeModel(model.name)
                print(f"   ✅ 状态: 可用")
            except Exception as e:
                print(f"   ❌ 状态: 不可用 - {str(e)[:50]}")
            
            print("-" * 30)
        
        # 测试具体模型
        print("\n🧪 测试具体模型功能:")
        print("-" * 50)
        
        test_models = [
            "gemini-2.0-flash-exp",
            "gemini-1.5-flash",
            "gemini-1.5-pro",
            "gemini-2.0-flash-thinking-exp",
            "gemini-2.0-flash-lite-preview-02-05"
        ]
        
        for model_name in test_models:
            print(f"\n测试模型: {model_name}")
            try:
                model = genai.GenerativeModel(model_name)
                response = model.generate_content("Hello, what is 2+2?")
                print(f"  ✅ 响应成功: {response.text[:50]}...")
                print(f"  📊 使用令牌: {response.usage_metadata}")
            except Exception as e:
                print(f"  ❌ 错误: {str(e)[:80]}")
        
        # 测试最新模型
        print("\n🚀 测试最新 Gemini 2.5 Pro 模型:")
        print("-" * 50)
        
        latest_models = [
            "gemini-2.0-flash-thinking-exp-1219",
            "gemini-2.5-pro-exp-03-25",
            "gemini-2.5-flash-exp-03-25"
        ]
        
        for model_name in latest_models:
            print(f"\n测试: {model_name}")
            try:
                model = genai.GenerativeModel(model_name)
                response = model.generate_content("简要介绍你自己")
                print(f"  ✅ 成功: {response.text[:80]}...")
            except Exception as e:
                error_msg = str(e)
                if "not found" in error_msg.lower():
                    print(f"  ⚠️  模型不存在")
                elif "quota" in error_msg.lower() or "resource" in error_msg.lower():
                    print(f"  ⚠️  限额或资源问题")
                else:
                    print(f"  ❌ 错误: {error_msg[:60]}")
        
        print("\n" + "=" * 50)
        print("🎉 测试完成!")
        
    except Exception as e:
        print(f"❌ 测试失败: {str(e)}")
        print("\n可能的原因:")
        print("1. API 密钥无效")
        print("2. 网络连接问题")
        print("3. Google Generative AI 库未安装")
        print("4. API 服务区域限制")

if __name__ == "__main__":
    # 首先安装必要的库
    import subprocess
    import sys
    
    print("🔧 安装必要的 Python 库...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "google-generativeai", "-q"])
        print("✅ 库安装成功")
    except:
        print("⚠️  库安装失败，尝试继续...")
    
    test_gemini_models()