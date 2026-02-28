from flask import render_template, flash, redirect, url_for, request, abort
from flask_login import current_user, login_required
from app import db
from blog import bp
from blog.forms import PostForm, CommentForm
from models import Post, Category, Tag, Comment

@bp.route('/')
@bp.route('/index')
def index():
    page = request.args.get('page', 1, type=int)
    posts = Post.query.filter_by(published=True)\
        .order_by(Post.created_at.desc())\
        .paginate(page=page, per_page=10, error_out=False)
    
    categories = Category.query.all()
    tags = Tag.query.all()
    
    return render_template('blog/list.html', 
                         title='Home',
                         posts=posts,
                         categories=categories,
                         tags=tags)

@bp.route('/post/<int:post_id>', methods=['GET', 'POST'])
def view_post(post_id):
    post = Post.query.get_or_404(post_id)
    
    if not post.published and (not current_user.is_authenticated or current_user.id != post.user_id):
        abort(404)
    
    form = CommentForm()
    if form.validate_on_submit():
        if not current_user.is_authenticated:
            flash('Please log in to comment.', 'warning')
            return redirect(url_for('auth.login'))
        
        comment = Comment(
            content=form.content.data,
            user_id=current_user.id,
            post_id=post.id
        )
        db.session.add(comment)
        db.session.commit()
        flash('Your comment has been added!', 'success')
        return redirect(url_for('blog.view_post', post_id=post.id))
    
    return render_template('blog/view.html', 
                         title=post.title,
                         post=post,
                         form=form)

@bp.route('/create', methods=['GET', 'POST'])
@login_required
def create():
    form = PostForm()
    
    # Populate category choices
    form.category_id.choices = [(c.id, c.name) for c in Category.query.all()]
    
    if form.validate_on_submit():
        post = Post(
            title=form.title.data,
            content=form.content.data,
            user_id=current_user.id,
            category_id=form.category_id.data if form.category_id.data else None,
            published=form.published.data
        )
        
        # Handle tags
        tag_names = [t.strip() for t in form.tags.data.split(',') if t.strip()]
        for tag_name in tag_names:
            tag = Tag.query.filter_by(name=tag_name).first()
            if not tag:
                tag = Tag(name=tag_name)
                db.session.add(tag)
            post.tags.append(tag)
        
        db.session.add(post)
        db.session.commit()
        flash('Your post has been created!', 'success')
        return redirect(url_for('blog.view_post', post_id=post.id))
    
    return render_template('blog/create.html', title='Create Post', form=form)

@bp.route('/post/<int:post_id>/edit', methods=['GET', 'POST'])
@login_required
def edit(post_id):
    post = Post.query.get_or_404(post_id)
    
    # Check if user owns the post or is admin
    if current_user.id != post.user_id and not current_user.is_admin:
        abort(403)
    
    form = PostForm()
    form.category_id.choices = [(c.id, c.name) for c in Category.query.all()]
    
    if request.method == 'GET':
        form.title.data = post.title
        form.content.data = post.content
        form.category_id.data = post.category_id
        form.published.data = post.published
        form.tags.data = ', '.join([tag.name for tag in post.tags])
    
    if form.validate_on_submit():
        post.title = form.title.data
        post.content = form.content.data
        post.category_id = form.category_id.data if form.category_id.data else None
        post.published = form.published.data
        
        # Update tags
        post.tags.clear()
        tag_names = [t.strip() for t in form.tags.data.split(',') if t.strip()]
        for tag_name in tag_names:
            tag = Tag.query.filter_by(name=tag_name).first()
            if not tag:
                tag = Tag(name=tag_name)
                db.session.add(tag)
            post.tags.append(tag)
        
        db.session.commit()
        flash('Your post has been updated!', 'success')
        return redirect(url_for('blog.view_post', post_id=post.id))
    
    return render_template('blog/edit.html', title='Edit Post', form=form, post=post)

@bp.route('/post/<int:post_id>/delete', methods=['POST'])
@login_required
def delete(post_id):
    post = Post.query.get_or_404(post_id)
    
    # Check if user owns the post or is admin
    if current_user.id != post.user_id and not current_user.is_admin:
        abort(403)
    
    db.session.delete(post)
    db.session.commit()
    flash('Your post has been deleted!', 'success')
    return redirect(url_for('blog.index'))

@bp.route('/category/<int:category_id>')
def category_posts(category_id):
    category = Category.query.get_or_404(category_id)
    page = request.args.get('page', 1, type=int)
    
    posts = Post.query.filter_by(category_id=category_id, published=True)\
        .order_by(Post.created_at.desc())\
        .paginate(page=page, per_page=10, error_out=False)
    
    return render_template('blog/list.html',
                         title=f'Posts in {category.name}',
                         posts=posts,
                         category=category)

@bp.route('/tag/<string:tag_name>')
def tag_posts(tag_name):
    tag = Tag.query.filter_by(name=tag_name).first_or_404()
    page = request.args.get('page', 1, type=int)
    
    posts = tag.posts.filter_by(published=True)\
        .order_by(Post.created_at.desc())\
        .paginate(page=page, per_page=10, error_out=False)
    
    return render_template('blog/list.html',
                         title=f'Posts tagged with {tag_name}',
                         posts=posts,
                         tag=tag)