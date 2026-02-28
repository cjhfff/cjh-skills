from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, BooleanField, SubmitField, SelectField
from wtforms.validators import DataRequired, Length, Optional

class PostForm(FlaskForm):
    title = StringField('Title', validators=[
        DataRequired(),
        Length(min=3, max=200, message='Title must be between 3 and 200 characters')
    ])
    content = TextAreaField('Content', validators=[DataRequired()])
    category_id = SelectField('Category', coerce=int, validators=[Optional()])
    tags = StringField('Tags (comma separated)', validators=[Optional()])
    published = BooleanField('Publish immediately', default=True)
    submit = SubmitField('Save')

class CommentForm(FlaskForm):
    content = TextAreaField('Comment', validators=[
        DataRequired(),
        Length(min=3, max=1000, message='Comment must be between 3 and 1000 characters')
    ])
    submit = SubmitField('Post Comment')