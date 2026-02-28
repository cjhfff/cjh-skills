#!/usr/bin/env python3
"""
Simple database initialization
"""

import os
import sys

# Add current directory to path
sys.path.insert(0, os.path.dirname(__file__))

# First create a minimal app to initialize database
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash

# Create Flask app
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///personal_blog.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'dev-secret-key-change-in-production'

# Initialize database
db = SQLAlchemy(app)

# Define models inline
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256))
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    
    def set_password(self, password):
        # Simple password hashing for development
        import hashlib
        self.password_hash = hashlib.sha256(password.encode()).hexdigest()

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.String(200))

def init_database():
    """Initialize database with test data"""
    with app.app_context():
        # Create database directory
        os.makedirs('instance', exist_ok=True)
        
        # Create all tables
        db.create_all()
        print('✅ Database tables created successfully')
        
        # Create default categories
        if Category.query.count() == 0:
            categories = [
                Category(name='Technology', description='Tech-related articles'),
                Category(name='Lifestyle', description='Life and personal stories'),
                Category(name='Tutorials', description='Step-by-step guides'),
                Category(name='News', description='Latest updates and news')
            ]
            for cat in categories:
                db.session.add(cat)
            db.session.commit()
            print('✅ Created 4 default categories')
        
        # Create test users
        if User.query.count() == 0:
            # Create admin user
            admin = User(username='admin', email='admin@example.com')
            admin.set_password('admin123')
            admin.is_admin = True
            
            # Create regular users
            user1 = User(username='alice', email='alice@example.com')
            user1.set_password('password123')
            
            user2 = User(username='bob', email='bob@example.com')
            user2.set_password('password123')
            
            db.session.add_all([admin, user1, user2])
            db.session.commit()
            print('✅ Created 3 test users')
            print('   - admin / admin123 (Administrator)')
            print('   - alice / password123')
            print('   - bob / password123')
        
        print('🎉 Database initialization completed!')
        print('📁 Database file: instance/personal_blog.db')

if __name__ == '__main__':
    init_database()