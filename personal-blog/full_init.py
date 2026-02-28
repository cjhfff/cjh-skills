#!/usr/bin/env python3
"""
Complete database initialization for Personal Blog
"""

import os
import sys
sys.path.insert(0, os.path.dirname(__file__))

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import hashlib

# Create Flask app
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///personal_blog.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'dev-secret-key-change-in-production'

# Initialize database
db = SQLAlchemy(app)

# Define complete models matching models.py
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256))
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    
    def set_password(self, password):
        self.password_hash = hashlib.sha256(password.encode()).hexdigest()

class Post(db.Model):
    __tablename__ = 'posts'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())
    published = db.Column(db.Boolean, default=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'))

class Category(db.Model):
    __tablename__ = 'categories'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.String(200))

class Tag(db.Model):
    __tablename__ = 'tags'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)

class Comment(db.Model):
    __tablename__ = 'comments'
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id'))

# Association table for many-to-many relationship
post_tags = db.Table('post_tags',
    db.Column('post_id', db.Integer, db.ForeignKey('posts.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tags.id'), primary_key=True)
)

def init_database():
    """Initialize database with all tables and test data"""
    with app.app_context():
        # Create database directory
        os.makedirs('instance', exist_ok=True)
        
        # Drop all tables and recreate (for development)
        db.drop_all()
        db.create_all()
        print('✅ All database tables created successfully')
        print('   Tables created: users, posts, categories, tags, comments, post_tags')
        
        # Create default categories
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
        # Admin user
        admin = User(username='admin', email='admin@example.com')
        admin.set_password('admin123')
        admin.is_admin = True
        
        # Regular users
        user1 = User(username='alice', email='alice@example.com')
        user1.set_password('password123')
        
        user2 = User(username='bob', email='bob@example.com')
        user2.set_password('password123')
        
        db.session.add_all([admin, user1, user2])
        db.session.commit()
        print('✅ Created 3 test users')
        
        # Create sample posts
        from datetime import datetime
        
        # Get user and category references
        admin_user = User.query.filter_by(username='admin').first()
        tech_category = Category.query.filter_by(name='Technology').first()
        
        if admin_user and tech_category:
            posts = [
                Post(
                    title='Welcome to Personal Blog',
                    content='This is the first post on our new blog platform!',
                    user_id=admin_user.id,
                    category_id=tech_category.id,
                    published=True
                ),
                Post(
                    title='Getting Started with Flask',
                    content='Learn how to build web applications with Flask.',
                    user_id=admin_user.id,
                    category_id=tech_category.id,
                    published=True
                )
            ]
            
            for post in posts:
                db.session.add(post)
            db.session.commit()
            print('✅ Created 2 sample blog posts')
        
        # Create sample tags
        tags = ['python', 'flask', 'web', 'tutorial', 'beginner']
        tag_objects = []
        for tag_name in tags:
            tag = Tag(name=tag_name)
            db.session.add(tag)
            tag_objects.append(tag)
        db.session.commit()
        print('✅ Created 5 sample tags')
        
        print('🎉 Database initialization completed!')
        print('📁 Database file: instance/personal_blog.db')
        print('')
        print('📋 Test Accounts:')
        print('   - admin / admin123 (Administrator)')
        print('   - alice / password123')
        print('   - bob / password123')

if __name__ == '__main__':
    init_database()