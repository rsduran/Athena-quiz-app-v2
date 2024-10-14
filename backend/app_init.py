# app_init.py

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from authlib.integrations.flask_client import OAuth
from dotenv import load_dotenv
import os
from datetime import timedelta
from db import db, init_db  # Import db and init_db function

# Load environment variables
load_dotenv(dotenv_path='../.env')

# Create Flask app
app = Flask(__name__)

# Set environment
ENV = os.getenv('FLASK_ENV', 'development')
print(f"[DEBUG] Flask environment: {ENV}")

# Database configuration
DB_HOST = os.getenv('DB_HOST', 'localhost' if ENV == 'development' else 'db')
DB_NAME = os.getenv('DB_NAME', 'quizdb')
DB_USER = os.getenv('DB_USER', 'my_user')
DB_PASS = os.getenv('DB_PASS', 'password')

# Configure app
app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:5432/{DB_NAME}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.secret_key = os.getenv('SECRET_KEY', 'your_default_secret_key')

print(f"[DEBUG] Database URI: postgresql://{DB_USER}:{'*' * len(DB_PASS)}@{DB_HOST}:5432/{DB_NAME}")

# Initialize extensions
init_db(app)  # Initialize db with the app
oauth = OAuth(app)

# Configure CORS
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)
print("[DEBUG] CORS configured")

# Configure GitHub OAuth
app.config['GITHUB_CLIENT_ID'] = os.getenv('GITHUB_CLIENT_ID')
app.config['GITHUB_CLIENT_SECRET'] = os.getenv('GITHUB_CLIENT_SECRET')
app.config['FRONTEND_URL'] = os.getenv('FRONTEND_URL', 'http://localhost:3000')

print(f"[DEBUG] GitHub Client ID: {app.config['GITHUB_CLIENT_ID']}")
print(f"[DEBUG] GitHub Client Secret: {'*' * len(app.config['GITHUB_CLIENT_SECRET'] or '')}")
print(f"[DEBUG] Frontend URL: {app.config['FRONTEND_URL']}")

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

# Function to recreate database
def recreate_database():
    with app.app_context():
        # Drop all tables
        db.drop_all()
        print("[DEBUG] All tables dropped")

        # Create all tables
        db.create_all()
        print("[DEBUG] Database tables created")

# Recreate database
recreate_database()

# Import routes at the end to avoid circular imports
from routes import *

if __name__ == '__main__':
    app.run(debug=ENV == 'development')