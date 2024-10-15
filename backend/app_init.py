# app_init.py

from flask import Flask
from flask_cors import CORS
from authlib.integrations.flask_client import OAuth
from dotenv import load_dotenv
import os
from datetime import timedelta
from db import db, init_db
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv(dotenv_path='../.env')

# Create Flask app
app = Flask(__name__)

# Set environment
ENV = os.getenv('FLASK_ENV', 'development')
logger.info(f"Flask environment: {ENV}")

# Database configuration
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_NAME = os.getenv('DB_NAME', 'quizdb')
DB_USER = os.getenv('DB_USER', 'my_user')
DB_PASS = os.getenv('DB_PASS', 'password')

# Configure app
app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:5432/{DB_NAME}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.secret_key = os.getenv('SECRET_KEY', 'your_default_secret_key')

logger.info(f"Database URI: postgresql://{DB_USER}:{'*' * len(DB_PASS)}@{DB_HOST}:5432/{DB_NAME}")

# Initialize database
init_db(app)

# Configure CORS
CORS(app, resources={r"/api/*": {"origins": os.getenv('FRONTEND_URL', 'http://localhost:3000')}}, supports_credentials=True)
logger.info("CORS configured")

# Configure OAuth
oauth = OAuth(app)

# Configure GitHub OAuth
app.config['GITHUB_CLIENT_ID'] = os.getenv('GITHUB_CLIENT_ID')
app.config['GITHUB_CLIENT_SECRET'] = os.getenv('GITHUB_CLIENT_SECRET')
app.config['FRONTEND_URL'] = os.getenv('FRONTEND_URL', 'http://localhost:3000')

logger.info(f"GitHub Client ID: {app.config['GITHUB_CLIENT_ID']}")
logger.info(f"GitHub Client Secret: {'*' * len(app.config['GITHUB_CLIENT_SECRET'] or '')}")
logger.info(f"Frontend URL: {app.config['FRONTEND_URL']}")

# Session configuration
app.config['SESSION_COOKIE_NAME'] = 'github_oauth_session'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SECURE'] = ENV == 'production'
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

logger.info(f"Session cookie settings - Name: {app.config['SESSION_COOKIE_NAME']}, "
            f"Lifetime: {app.config['PERMANENT_SESSION_LIFETIME']}, "
            f"HttpOnly: {app.config['SESSION_COOKIE_HTTPONLY']}, "
            f"Secure: {app.config['SESSION_COOKIE_SECURE']}, "
            f"SameSite: {app.config['SESSION_COOKIE_SAMESITE']}")

# Configure GitHub OAuth
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

# Import routes at the end to avoid circular imports
from routes import *

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=ENV == 'development')