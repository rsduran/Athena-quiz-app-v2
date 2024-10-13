# app_init.py

import os
from flask import Flask
from authlib.integrations.flask_client import OAuth
from flask_cors import CORS
from db import db
from datetime import timedelta

# Initialize Flask app
app = Flask(__name__)

# Initialize OAuth
oauth = OAuth(app)

# Configure GitHub OAuth
app.config['GITHUB_CLIENT_ID'] = os.environ.get('GITHUB_CLIENT_ID')
app.config['GITHUB_CLIENT_SECRET'] = os.environ.get('GITHUB_CLIENT_SECRET')
app.config['FRONTEND_URL'] = os.getenv('FRONTEND_URL', 'k8s-threetie-mainlb-7703746d77-255087660.ap-southeast-2.elb.amazonaws.com')

print(f"[DEBUG] GitHub Client ID: {app.config['GITHUB_CLIENT_ID']}")
print(f"[DEBUG] GitHub Client Secret: {'*' * len(app.config['GITHUB_CLIENT_SECRET'] or '')}")
print(f"[DEBUG] Frontend URL: {app.config['FRONTEND_URL']}")

# Register GitHub OAuth only if both client ID and secret are available
if app.config['GITHUB_CLIENT_ID'] and app.config['GITHUB_CLIENT_SECRET']:
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
else:
    print("[WARNING] GitHub OAuth is not configured. Some features may not work.")

# Set secret key
app.secret_key = os.getenv('SECRET_KEY', 'your_default_secret_key')
print(f"[DEBUG] Secret key set: {'*' * len(app.secret_key)}")

# Set environment
ENV = os.getenv('FLASK_ENV', 'development')
print(f"[DEBUG] Flask environment: {ENV}")

# Database configuration
DB_HOST = os.getenv('DB_HOST', 'localhost' if ENV == 'development' else 'db')
DB_NAME = os.getenv('DB_NAME', 'quizdb')
DB_USER = os.getenv('DB_USER', 'my_user')
DB_PASS = os.getenv('DB_PASS', 'password')

app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:5432/{DB_NAME}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

print(f"[DEBUG] Database URI: postgresql://{DB_USER}:{'*' * len(DB_PASS)}@{DB_HOST}:5432/{DB_NAME}")

# Initialize database
db.init_app(app)

# Configure CORS
CORS(app, resources={r"/api/*": {"origins": "*", "supports_credentials": True}})
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

# Import routes
import routes

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

# Run the app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)