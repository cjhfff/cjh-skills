#!/usr/bin/env python3
"""
Debug version of Personal Blog to identify the issue
"""

import os
import sys
sys.path.insert(0, os.path.dirname(__file__))

from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_bootstrap import Bootstrap

# Create app
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///personal_blog.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'debug-secret-key'

# Initialize extensions
db = SQLAlchemy(app)
login_manager = LoginManager(app)
bootstrap = Bootstrap(app)

# Define simplified models
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)

class Post(db.Model):
    __tablename__ = 'posts'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)

class Category(db.Model):
    __tablename__ = 'categories'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)

# Simple routes for testing
@app.route('/')
def index():
    try:
        posts = Post.query.all()
        return f"""
        <h1>Debug Page - Personal Blog</h1>
        <p>Database connection: OK</p>
        <p>Posts in database: {len(posts)}</p>
        <p>Users in database: {User.query.count()}</p>
        <p>Categories in database: {Category.query.count()}</p>
        <hr>
        <h2>Posts:</h2>
        <ul>
        {"".join(f'<li>{post.title}</li>' for post in posts)}
        </ul>
        """
    except Exception as e:
        return f"""
        <h1>Error Debug Page</h1>
        <p>Error: {str(e)}</p>
        <p>Error type: {type(e).__name__}</p>
        <hr>
        <h2>Database tables:</h2>
        <pre>{os.popen('sqlite3 instance/personal_blog.db ".tables"').read()}</pre>
        """

@app.route('/test-db')
def test_db():
    """Test database connection directly"""
    import sqlite3
    try:
        conn = sqlite3.connect('instance/personal_blog.db')
        cursor = conn.cursor()
        
        # Get all tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        # Get table info
        table_info = {}
        for table in tables:
            cursor.execute(f"PRAGMA table_info({table[0]});")
            table_info[table[0]] = cursor.fetchall()
        
        conn.close()
        
        # Format output
        output = "<h1>Database Debug Info</h1>"
        output += f"<p>Tables found: {len(tables)}</p>"
        
        for table_name, columns in table_info.items():
            output += f"<h3>Table: {table_name}</h3>"
            output += "<table border='1'><tr><th>CID</th><th>Name</th><th>Type</th><th>NotNull</th><th>Default</th><th>PK</th></tr>"
            for col in columns:
                output += f"<tr><td>{col[0]}</td><td>{col[1]}</td><td>{col[2]}</td><td>{col[3]}</td><td>{col[4]}</td><td>{col[5]}</td></tr>"
            output += "</table>"
        
        return output
    except Exception as e:
        return f"<h1>Database Error</h1><p>{str(e)}</p>"

if __name__ == '__main__':
    print("🔧 Starting Debug Server...")
    print("🌐 Access: http://localhost:5070")
    print("📊 Test pages:")
    print("   - / : Main debug page")
    print("   - /test-db : Database structure")
    app.run(debug=True, host='0.0.0.0', port=5070)