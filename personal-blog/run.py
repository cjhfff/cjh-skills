#!/usr/bin/env python3
import os
import sys
sys.path.insert(0, os.path.dirname(__file__))

from app import create_app

app = create_app()

if __name__ == '__main__':
    PORT = 5060  # 使用 5060 端口避免冲突
    print("🚀 Starting Personal Blog...")
    print("🌐 Access: http://localhost:{}".format(PORT))
    print("🌐 Network: http://0.0.0.0:{}".format(PORT))
    print("🛑 Press Ctrl+C to stop")
    app.run(debug=True, host='0.0.0.0', port=PORT)