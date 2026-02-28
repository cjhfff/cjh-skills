from flask import render_template, flash, redirect, url_for, request
from flask_login import login_required, current_user
from app import db
from admin import bp
from models import User, Post, Category, Tag, Comment

@bp.route('/dashboard')
@login_required
def dashboard():
    if not current_user.is_admin:
        flash('You do not have permission to access the admin dashboard.', 'danger')
        return redirect(url_for('blog.index'))
    
    stats = {
        'total_users': User.query.count(),
        'total_posts': Post.query.count(),
        'total_categories': Category.query.count(),
        'total_tags': Tag.query.count(),
        'total_comments': Comment.query.count(),
        'recent_posts': Post.query.order_by(Post.created_at.desc()).limit(5).all(),
        'recent_users': User.query.order_by(User.created_at.desc()).limit(5).all()
    }
    
    return render_template('admin/dashboard.html', title='Admin Dashboard', stats=stats)

@bp.route('/users')
@login_required
def users():
    if not current_user.is_admin:
        flash('You do not have permission to view users.', 'danger')
        return redirect(url_for('blog.index'))
    
    page = request.args.get('page', 1, type=int)
    users = User.query.order_by(User.created_at.desc())\
        .paginate(page=page, per_page=20, error_out=False)
    
    return render_template('admin/users.html', title='Manage Users', users=users)

@bp.route('/posts')
@login_required
def posts():
    if not current_user.is_admin:
        flash('You do not have permission to manage posts.', 'danger')
        return redirect(url_for('blog.index'))
    
    page = request.args.get('page', 1, type=int)
    posts = Post.query.order_by(Post.created_at.desc())\
        .paginate(page=page, per_page=20, error_out=False)
    
    return render_template('admin/posts.html', title='Manage Posts', posts=posts)

@bp.route('/categories')
@login_required
def categories():
    if not current_user.is_admin:
        flash('You do not have permission to manage categories.', 'danger')
        return redirect(url_for('blog.index'))
    
    categories = Category.query.all()
    return render_template('admin/categories.html', title='Manage Categories', categories=categories)