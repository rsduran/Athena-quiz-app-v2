# models.py

from db import db
import uuid
from sqlalchemy.ext.hybrid import hybrid_property

class QuizSet(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(120), nullable=False)
    urls = db.Column(db.Text, nullable=True)
    raw_urls = db.Column(db.Text, nullable=True)
    eye_icon_state = db.Column(db.Boolean, default=True) 
    lock_state = db.Column(db.Boolean, default=True)
    score = db.Column(db.Integer, nullable=True)
    attempts = db.Column(db.Integer, default=0)
    
    questions = db.relationship('Question', backref='quiz_set', lazy=True, cascade="all, delete-orphan")
    attempts_list = db.relationship('Attempt', backref='quiz_set', lazy=True, cascade="all, delete-orphan")

    @hybrid_property
    def average_score(self):
        if not self.attempts_list:
            return None
        return sum(attempt.score for attempt in self.attempts_list) / len(self.attempts_list)

    @hybrid_property
    def latest_score(self):
        if not self.attempts_list:
            return None
        return self.attempts_list[-1].score if self.attempts_list else None

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
    order = db.Column(db.Integer, nullable=False)
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

class Attempt(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    quiz_set_id = db.Column(db.String(36), db.ForeignKey('quiz_set.id'), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    timestamp = db.Column(db.DateTime, default=db.func.now())