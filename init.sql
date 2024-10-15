-- init.sql
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    github_id VARCHAR(50) UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE,
    password_hash VARCHAR(255),
    avatar_url VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS quiz_sets (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(120) NOT NULL,
    urls TEXT,
    raw_urls TEXT,
    eye_icon_state BOOLEAN DEFAULT TRUE,
    lock_state BOOLEAN DEFAULT TRUE,
    score INTEGER,
    attempts INTEGER DEFAULT 0,
    finished BOOLEAN DEFAULT FALSE,
    progress INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    sort_order VARCHAR(4) DEFAULT 'desc',
    current_question_index INTEGER DEFAULT 0,
    current_filter VARCHAR(20) DEFAULT 'all',
    user_id INTEGER NOT NULL REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    options BYTEA NOT NULL,
    answer VARCHAR(10) NOT NULL,
    quiz_set_id VARCHAR(36) NOT NULL REFERENCES quiz_sets(id),
    favorite BOOLEAN DEFAULT FALSE,
    url VARCHAR(255),
    explanation TEXT,
    discussion_link VARCHAR(255),
    user_selected_option VARCHAR(10),
    "order" INTEGER NOT NULL,
    discussion_comments TEXT
);

CREATE TABLE IF NOT EXISTS editor_contents (
    id VARCHAR(36) PRIMARY KEY,
    content TEXT NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS further_explanations (
    id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL REFERENCES questions(id),
    explanation TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS attempts (
    id SERIAL PRIMARY KEY,
    quiz_set_id VARCHAR(36) NOT NULL REFERENCES quiz_sets(id),
    score INTEGER NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);