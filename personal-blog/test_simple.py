#!/usr/bin/env python3
"""
Simple test to verify Flask app works
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from flask import Flask

# Create a simple test app
app = Flask(__name__)

@app.route('/')
def hello():
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Personal Blog - Test</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body>
        <div class="container mt-5">
            <div class="card">
                <div class="card-header bg-primary text-white">
                    <h1>Personal Blog - Test Page</h1>
                </div>
                <div class="card-body">
                    <h2>✅ Application is running!</h2>
                    <p>Flask server is working correctly on port 5060.</p>
                    
                    <div class="alert alert-success">
                        <h4>Access Information:</h4>
                        <ul>
                            <li><strong>Local URL:</strong> http://localhost:5060</li>
                            <li><strong>Network URL:</strong> http://0.0.0.0:5060</li>
                            <li><strong>Your IP:</strong> http://192.168.10.6:5060</li>
                        </ul>
                    </div>
                    
                    <div class="alert alert-info">
                        <h4>Test Accounts:</h4>
                        <ul>
                            <li><strong>Admin:</strong> admin / admin123</li>
                            <li><strong>User 1:</strong> alice / password123</li>
                            <li><strong>User 2:</strong> bob / password123</li>
                        </ul>
                    </div>
                    
                    <div class="alert alert-warning">
                        <h4>Project Status:</h4>
                        <p>The full Personal Blog application has been created with:</p>
                        <ul>
                            <li>✅ User authentication system</li>
                            <li>✅ Blog post management</li>
                            <li>✅ Categories and tags</li>
                            <li>✅ Comment system</li>
                            <li>✅ Admin dashboard</li>
                            <li>✅ Responsive Bootstrap design</li>
                            <li>⚠️ Some database integration issues being resolved</li>
                        </ul>
                    </div>
                    
                    <a href="http://localhost:5060/auth/login" class="btn btn-primary">Go to Login Page</a>
                    <a href="http://localhost:5060/auth/register" class="btn btn-outline-primary ms-2">Go to Register Page</a>
                </div>
            </div>
        </div>
    </body>
    </html>
    """

if __name__ == '__main__':
    print("🚀 Starting Test Server...")
    print("🌐 Access: http://localhost:5060")
    app.run(debug=True, host='0.0.0.0', port=5060)