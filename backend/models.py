# models.py

from db import db
import uuid

class QuizSet(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(120), nullable=False)
    questions = db.relationship('Question', backref='quiz_set', lazy=True)
    eye_icon_state = db.Column(db.Boolean, default=True) 
    lock_state = db.Column(db.Boolean, default=True)
    questions = db.relationship('Question', backref='quiz_set', lazy=True, cascade="all, delete-orphan")

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)
    options = db.Column(db.PickleType, nullable=False)
    answer = db.Column(db.String(10), nullable=False)
    quiz_set_id = db.Column(db.String(36), db.ForeignKey('quiz_set.id'), nullable=False)
    favorite = db.Column(db.Boolean, default=False)
    url = db.Column(db.String(255))
    explanation = db.Column(db.Text)
    discussion_link = db.Column(db.String(255))
    user_selected_option = db.Column(db.String(10), nullable=True)
    order = db.Column(db.Integer, nullable=False)  # Ensure this field is not nullable
    further_explanation = db.relationship('FurtherExplanation', backref='question', lazy=True)
    discussion_comments = db.Column(db.Text)
    further_explanation = db.relationship('FurtherExplanation', backref='question', lazy=True, cascade="all, delete-orphan")

class EditorContent(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    content = db.Column(db.Text, nullable=False)

    def __repr__(self):
        return f'<EditorContent {self.id}>'

class FurtherExplanation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey('question.id'), nullable=False)
    explanation = db.Column(db.Text, nullable=False)