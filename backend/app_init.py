# app_init.py

import os
from flask import Flask
from authlib.integrations.flask_client import OAuth
from flask_cors import CORS
from db import db
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

app = Flask(__name__)
oauth = OAuth(app)

app.config['GITHUB_CLIENT_ID'] = os.environ.get('GITHUB_CLIENT_ID')
app.config['GITHUB_CLIENT_SECRET'] = os.environ.get('GITHUB_CLIENT_SECRET')
app.config['FRONTEND_URL'] = os.getenv('FRONTEND_URL', 'http://localhost:3000')

print(f"[DEBUG] GitHub Client ID: {app.config['GITHUB_CLIENT_ID']}")
print(f"[DEBUG] GitHub Client Secret: {'*' * len(app.config['GITHUB_CLIENT_SECRET'])}")
print(f"[DEBUG] Frontend URL: {app.config['FRONTEND_URL']}")

github = oauth.register(
    name='github',
    client_id=app.config['GITHUB_CLIENT_ID'],
    client_secret=app.config['GITHUB_CLIENT_SECRET'],
    access_token_url='https://github.com/login/oauth/access_token',
    access_token_params=None,
    authorize_url='https://github.com/login/oauth/authorize',
    authorize_params=None,
    api_base_url='https://api.github.com/',
    client_kwargs={'scope': 'user:email'},
)

app.secret_key = os.getenv('SECRET_KEY', 'your_default_secret_key')
print(f"[DEBUG] Secret key set: {'*' * len(app.secret_key)}")

ENV = os.getenv('FLASK_ENV', 'development')
print(f"[DEBUG] Flask environment: {ENV}")

DB_HOST = os.getenv('DB_HOST', 'localhost' if ENV == 'development' else 'db')
DB_NAME = os.getenv('DB_NAME', 'quizdb')
DB_USER = os.getenv('DB_USER', 'my_user')
DB_PASS = os.getenv('DB_PASS', 'password')

app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:5432/{DB_NAME}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

print(f"[DEBUG] Database URI: postgresql://{DB_USER}:{'*' * len(DB_PASS)}@{DB_HOST}:5432/{DB_NAME}")

db.init_app(app)

CORS(app, resources={r"/api/*": {"origins": app.config['FRONTEND_URL'], "supports_credentials": True}})
print("[DEBUG] CORS configured")

# Session configuration
app.config['SESSION_COOKIE_NAME'] = 'github_oauth_session'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SECURE'] = ENV != 'development'  # True in production, False in development
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # or 'None' if your frontend is on a different domain

print(f"[DEBUG] Session cookie settings - Name: {app.config['SESSION_COOKIE_NAME']}, "
      f"Lifetime: {app.config['PERMANENT_SESSION_LIFETIME']}, "
      f"HttpOnly: {app.config['SESSION_COOKIE_HTTPONLY']}, "
      f"Secure: {app.config['SESSION_COOKIE_SECURE']}, "
      f"SameSite: {app.config['SESSION_COOKIE_SAMESITE']}")

import routes

with app.app_context():
    db.create_all()
    print("[DEBUG] Database tables created")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)