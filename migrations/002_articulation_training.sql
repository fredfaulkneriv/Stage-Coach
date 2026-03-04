-- Articulation Training: exercise progress tracking

CREATE TABLE IF NOT EXISTS articulation_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  exercise_type TEXT NOT NULL,
  exercise_id TEXT NOT NULL,
  tier INTEGER NOT NULL,
  difficulty_level INTEGER NOT NULL,
  user_response TEXT NOT NULL,
  score INTEGER NOT NULL,
  feedback TEXT NOT NULL,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_artic_user ON articulation_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_artic_tier ON articulation_progress(user_id, tier);
CREATE INDEX IF NOT EXISTS idx_artic_exercise ON articulation_progress(user_id, exercise_type, exercise_id);
