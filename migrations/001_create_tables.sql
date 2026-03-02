-- SpeakUp D1 Database Schema

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  goal TEXT NOT NULL,
  coaching_style TEXT NOT NULL,
  speech_profile TEXT NOT NULL DEFAULT 'standard',
  level TEXT NOT NULL DEFAULT 'Novice',
  xp INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_session_date TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'freestyle',
  topic TEXT,
  duration_seconds INTEGER NOT NULL,
  transcript TEXT,
  wpm REAL,
  filler_word_count INTEGER,
  filler_word_percentage REAL,
  filler_words_found TEXT,
  pacing_score INTEGER,
  clarity_score INTEGER,
  structure_score INTEGER,
  overall_score INTEGER,
  coaching_feedback TEXT,
  summary TEXT,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  r2_key TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  badge_key TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_description TEXT NOT NULL,
  earned_at TEXT NOT NULL,
  session_id TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_badges_user_id ON badges(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_badges_user_key ON badges(user_id, badge_key);
