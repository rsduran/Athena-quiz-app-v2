# db.py

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text
import time
import logging
import os

logger = logging.getLogger(__name__)

db = SQLAlchemy()

def init_db(app):
    db.init_app(app)
    
    with app.app_context():
        max_retries = 5
        retry_delay = 5  # seconds

        for attempt in range(max_retries):
            try:
                # Try to execute a simple query to check the connection
                db.session.execute(text('SELECT 1'))
                logger.info("Database connection successful")

                # Import all models here
                from models import User, QuizSet, Question, EditorContent, FurtherExplanation, Attempt

                # Create all tables
                db.create_all()
                logger.info("Database tables created successfully")

                # List all tables
                inspector = db.inspect(db.engine)
                tables = inspector.get_table_names()
                logger.info(f"Created tables: {tables}")

                # Commit the changes
                db.session.commit()
                logger.info("Changes committed to database")
                
                break
            except Exception as e:
                logger.error(f"Error during database initialization: {str(e)}")
                if attempt < max_retries - 1:
                    logger.warning(f"Retrying in {retry_delay} seconds...")
                    time.sleep(retry_delay)
                else:
                    logger.error(f"Failed to initialize database after {max_retries} attempts")
                    if os.getenv('FLASK_ENV') == 'development':
                        logger.error("In development mode. Please ensure your local PostgreSQL server is running and accessible.")
                    else:
                        logger.error("In production mode. Please check your Docker configuration and ensure the database service is running.")
                    raise e