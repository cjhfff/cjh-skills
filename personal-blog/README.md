# Personal Blog

A modern, responsive personal blog platform built with Flask, SQLite, and Bootstrap 5.

## Features

- **User Authentication**: Register, login, logout with secure password hashing
- **Blog Management**: Create, read, update, delete blog posts
- **Categories & Tags**: Organize posts with categories and tags
- **Comments**: Users can comment on posts
- **Admin Dashboard**: Manage users, posts, and categories
- **Responsive Design**: Mobile-friendly Bootstrap 5 interface
- **Markdown Support**: Write posts using Markdown formatting
- **Search & Filter**: Browse posts by category, tag, or author

## Technology Stack

- **Backend**: Flask 3.0.0
- **Database**: SQLite with SQLAlchemy ORM
- **Frontend**: Bootstrap 5.3, JavaScript
- **Authentication**: Flask-Login
- **Forms**: Flask-WTF with WTForms
- **Markdown Editor**: SimpleMDE
- **Database Migrations**: Flask-Migrate

## Project Structure

```
personal-blog/
├── app.py                 # Flask application factory
├── config.py             # Configuration settings
├── models.py             # Database models
├── requirements.txt      # Python dependencies
├── run.py               # Application entry point
├── .env                 # Environment variables
├── .gitignore
├── README.md            # This file
├── static/              # Static assets
│   ├── css/
│   ├── js/
│   └── images/
├── templates/           # Jinja2 templates
│   ├── base.html
│   ├── auth/           # Authentication templates
│   ├── blog/           # Blog templates
│   └── admin/          # Admin templates
├── auth/               # Authentication blueprint
│   ├── __init__.py
│   ├── routes.py
│   └── forms.py
├── blog/               # Blog blueprint
│   ├── __init__.py
│   ├── routes.py
│   └── forms.py
├── admin/              # Admin blueprint
│   ├── __init__.py
│   └── routes.py
└── instance/           # Database instance
```

## Installation

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Setup

1. **Clone the repository** (if applicable):
   ```bash
   git clone <repository-url>
   cd personal-blog
   ```

2. **Create a virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**:
   ```bash
   cp .env.example .env  # Create your own .env file
   # Edit .env and set your SECRET_KEY
   ```

5. **Initialize the database**:
   ```bash
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
   ```

6. **Create an admin user** (optional):
   ```bash
   flask shell
   >>> from app import db
   >>> from app.models import User
   >>> admin = User(username='admin', email='admin@example.com', is_admin=True)
   >>> admin.set_password('admin123')
   >>> db.session.add(admin)
   >>> db.session.commit()
   >>> exit()
   ```

## Running the Application

### Development Mode

```bash
python run.py
```

Or using Flask CLI:

```bash
export FLASK_APP=app.py
export FLASK_ENV=development
flask run
```

The application will be available at `http://localhost:5000`

### Production Mode

For production deployment, consider using:

1. **Gunicorn** (for Unix-based systems):
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 run:app
   ```

2. **Waitress** (for Windows):
   ```bash
   pip install waitress
   waitress-serve --port=5000 run:app
   ```

## Usage

### As a Regular User

1. **Register** for a new account
2. **Login** with your credentials
3. **Browse** posts on the homepage
4. **Create** new blog posts
5. **Edit** or **delete** your own posts
6. **Comment** on posts

### As an Admin

1. **Login** with admin credentials
2. **Access** the admin dashboard at `/admin/dashboard`
3. **Manage** users, posts, and categories
4. **View** site statistics

## API Endpoints

### Authentication
- `GET /auth/login` - Login page
- `POST /auth/login` - Login form submission
- `GET /auth/register` - Registration page
- `POST /auth/register` - Registration form submission
- `GET /auth/logout` - Logout

### Blog
- `GET /` - Homepage with all posts
- `GET /post/<id>` - View a specific post
- `GET /create` - Create new post (authenticated)
- `POST /create` - Create post form submission
- `GET /post/<id>/edit` - Edit post (owner/admin only)
- `POST /post/<id>/edit` - Edit post form submission
- `POST /post/<id>/delete` - Delete post (owner/admin only)
- `GET /category/<id>` - Posts by category
- `GET /tag/<name>` - Posts by tag

### Admin
- `GET /admin/dashboard` - Admin dashboard
- `GET /admin/users` - Manage users
- `GET /admin/posts` - Manage posts
- `GET /admin/categories` - Manage categories

## Database Models

### User
- `id` (Integer, Primary Key)
- `username` (String, Unique)
- `email` (String, Unique)
- `password_hash` (String)
- `created_at` (DateTime)
- `is_admin` (Boolean)

### Post
- `id` (Integer, Primary Key)
- `title` (String)
- `content` (Text)
- `created_at` (DateTime)
- `updated_at` (DateTime)
- `published` (Boolean)
- `user_id` (Integer, Foreign Key)
- `category_id` (Integer, Foreign Key)

### Category
- `id` (Integer, Primary Key)
- `name` (String, Unique)
- `description` (String)

### Tag
- `id` (Integer, Primary Key)
- `name` (String, Unique)

### Comment
- `id` (Integer, Primary Key)
- `content` (Text)
- `created_at` (DateTime)
- `user_id` (Integer, Foreign Key)
- `post_id` (Integer, Foreign Key)

## Testing

Run the test suite:

```bash
python -m pytest tests/
```

Or run specific tests:

```bash
python -m pytest tests/test_basic.py -v
```

## Deployment

### Heroku

1. Create a `Procfile`:
   ```
   web: gunicorn run:app
   ```

2. Set environment variables on Heroku:
   ```bash
   heroku config:set SECRET_KEY=your-secret-key
   heroku config:set DATABASE_URL=your-database-url
   ```

3. Deploy:
   ```bash
   git push heroku main
   ```

### Docker

1. Create a `Dockerfile`:
   ```dockerfile
   FROM python:3.9-slim
   WORKDIR /app
   COPY requirements.txt .
   RUN pip install -r requirements.txt
   COPY . .
   CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "run:app"]
   ```

2. Build and run:
   ```bash
   docker build -t personal-blog .
   docker run -p 5000:5000 personal-blog
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Flask documentation and community
- Bootstrap for the responsive design framework
- SimpleMDE for the Markdown editor
- All contributors and users

## Support

For support, please:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

## Changelog

### v1.0.0 (Initial Release)
- User authentication system
- Blog post management
- Categories and tags
- Comment system
- Admin dashboard
- Responsive design
- Markdown support