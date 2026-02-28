#!/usr/bin/env python3
"""
Database initialization script for Personal Blog
"""

import os
import sys
sys.path.insert(0, os.path.dirname(__file__))

from app import create_app, db
from models import User, Category

def init_database():
    """Initialize the database with default data"""
    app = create_app()
    
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