#!/bin/bash
# Start Personal Blog Application

echo "🚀 Starting Personal Blog..."
echo "📁 Project: $(pwd)"
echo ""

# Check if database exists
if [ ! -f "instance/personal_blog.db" ]; then
    echo "📊 Initializing database..."
    python3 simple_init.py
    echo ""
fi

# Install dependencies if needed
echo "🔧 Checking dependencies..."
pip3 install flask flask-sqlalchemy flask-login flask-wtf flask-bootstrap flask-migrate python-dotenv > /dev/null 2>&1
echo "✅ Dependencies ready"
echo ""

# Start the application
PORT=5060
echo "🌐 Starting Flask server..."
echo "📱 Access URLs:"
echo "   - Local:  http://localhost:$PORT"
echo "   - Network: http://0.0.0.0:$PORT"
echo "   - On your phone: http://$(ipconfig getifaddr en0 2>/dev/null || echo 'YOUR_IP'):$PORT"
echo ""
echo "🛑 Press Ctrl+C to stop the server"
echo ""

python3 run.py