# models.py

from db import db
import uuid
from sqlalchemy.ext.hybrid import hybrid_property
from datetime import datetime
from pytz import timezone
from werkzeug.security import generate_password_hash, check_password_hash
import logging

logger = logging.getLogger(__name__)

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    github_id = db.Column(db.String(50), unique=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=True)
    password_hash = db.Column(db.String(255))
    avatar_url = db.Column(db.String(255))

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class QuizSet(db.Model):
    __tablename__ = 'quiz_sets'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(120), nullable=False)
    urls = db.Column(db.Text, nullable=True)
    raw_urls = db.Column(db.Text, nullable=True)
    eye_icon_state = db.Column(db.Boolean, default=True) 
    lock_state = db.Column(db.Boolean, default=True)
    score = db.Column(db.Integer, nullable=True)
    attempts = db.Column(db.Integer, default=0)
    finished = db.Column(db.Boolean, default=False)
    progress = db.Column(db.Integer, default=0)
    last_updated = db.Column(db.DateTime, default=lambda: datetime.now(timezone('Asia/Manila')))
    sort_order = db.Column(db.String(4), default='desc')
    current_question_index = db.Column(db.Integer, default=0)
    current_filter = db.Column(db.String(20), default='all')
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
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

    @hybrid_property
    def progress(self):
        if self.finished:
            return 100
        total_questions = len(self.questions)
        if total_questions == 0:
            return 0
        answered_questions = sum(1 for q in self.questions if q.user_selected_option is not None)
        return int((answered_questions / total_questions) * 100)

    @hybrid_property
    def unanswered_questions_count(self):
        total_questions = len(self.questions)
        if total_questions == 0:
            return 0
        unanswered_questions = sum(1 for q in self.questions if q.user_selected_option is None)
        return unanswered_questions

    def update_last_updated(self):
        self.last_updated = datetime.now(timezone('Asia/Manila'))
        db.session.commit()

class Question(db.Model):
    __tablename__ = 'questions'
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)
    options = db.Column(db.PickleType, nullable=False)
    answer = db.Column(db.String(10), nullable=False)
    quiz_set_id = db.Column(db.String(36), db.ForeignKey('quiz_sets.id'), nullable=False)
    favorite = db.Column(db.Boolean, default=False)
    url = db.Column(db.String(255))
    explanation = db.Column(db.Text)
    discussion_link = db.Column(db.String(255))
    user_selected_option = db.Column(db.String(10), nullable=True)
    order = db.Column(db.Integer, nullable=False)
    discussion_comments = db.Column(db.Text)
    
    further_explanation = db.relationship('FurtherExplanation', backref='question', lazy=True, cascade="all, delete-orphan")

class EditorContent(db.Model):
    __tablename__ = 'editor_contents'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    content = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    def __repr__(self):
        return f'<EditorContent {self.id}>'

class FurtherExplanation(db.Model):
    __tablename__ = 'further_explanations'
    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id'), nullable=False)
    explanation = db.Column(db.Text, nullable=False)

class Attempt(db.Model):
    __tablename__ = 'attempts'
    id = db.Column(db.Integer, primary_key=True)
    quiz_set_id = db.Column(db.String(36), db.ForeignKey('quiz_sets.id'), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    timestamp = db.Column(db.DateTime, default=db.func.now())

logger.info("All models loaded")