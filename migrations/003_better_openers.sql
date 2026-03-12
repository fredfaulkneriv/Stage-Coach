-- Better Openers: curated conversation starters library

CREATE TABLE IF NOT EXISTS openers (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  setting TEXT NOT NULL,           -- 'work' | 'social' | 'networking' | 'casual' | 'any'
  relationship_type TEXT NOT NULL, -- 'colleague' | 'new_acquaintance' | 'client' | 'stranger' | 'any'
  opener_type TEXT NOT NULL DEFAULT 'starter', -- 'starter' | 'deepener'
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_openers_setting ON openers(setting, relationship_type, opener_type);

-- Curated starter openers
INSERT OR IGNORE INTO openers VALUES
  ('op_001', 'What''s one thing that surprised you recently?', 'any', 'any', 'starter', '2026-01-01T00:00:00.000Z'),
  ('op_002', 'What are you working on that you''re most excited about right now?', 'work', 'any', 'starter', '2026-01-01T00:00:00.000Z'),
  ('op_003', 'What''s something you''re looking forward to this week?', 'any', 'any', 'starter', '2026-01-01T00:00:00.000Z'),
  ('op_004', 'What''s been the highlight of your week so far?', 'any', 'colleague', 'starter', '2026-01-01T00:00:00.000Z'),
  ('op_005', 'What brought you here today?', 'networking', 'any', 'starter', '2026-01-01T00:00:00.000Z'),
  ('op_006', 'What''s a project you can''t stop thinking about lately?', 'work', 'colleague', 'starter', '2026-01-01T00:00:00.000Z'),
  ('op_007', 'What made you get into what you do — was there a moment that clicked?', 'networking', 'new_acquaintance', 'starter', '2026-01-01T00:00:00.000Z'),
  ('op_008', 'Is there something from this event you''re planning to actually use?', 'networking', 'new_acquaintance', 'starter', '2026-01-01T00:00:00.000Z'),
  ('op_009', 'What''s a challenge you''re right in the middle of figuring out?', 'work', 'colleague', 'starter', '2026-01-01T00:00:00.000Z'),
  ('op_010', 'What''s the most useful thing you''ve learned in the last month?', 'any', 'any', 'starter', '2026-01-01T00:00:00.000Z'),
  ('op_011', 'What''s something you wish more people understood about your work?', 'networking', 'any', 'starter', '2026-01-01T00:00:00.000Z'),
  ('op_012', 'If you could change one thing about how this industry operates, what would it be?', 'work', 'any', 'starter', '2026-01-01T00:00:00.000Z'),
  ('op_013', 'What''s a skill you''ve been deliberately building lately?', 'any', 'new_acquaintance', 'starter', '2026-01-01T00:00:00.000Z'),
  ('op_014', 'What''s something surprisingly fun or interesting you''ve done recently?', 'casual', 'any', 'starter', '2026-01-01T00:00:00.000Z'),
  ('op_015', 'What''s something you''re still trying to figure out?', 'any', 'new_acquaintance', 'starter', '2026-01-01T00:00:00.000Z'),
  ('op_016', 'What does a win look like for you this quarter?', 'work', 'client', 'starter', '2026-01-01T00:00:00.000Z'),
  ('op_017', 'How did you two meet — what''s the actual story?', 'social', 'stranger', 'starter', '2026-01-01T00:00:00.000Z'),
  ('op_018', 'What''s been on your mind most this week?', 'casual', 'colleague', 'starter', '2026-01-01T00:00:00.000Z'),
  ('op_019', 'What do you do when you get genuinely stuck on something?', 'work', 'any', 'starter', '2026-01-01T00:00:00.000Z'),
  ('op_020', 'What''s the most interesting conversation you''ve had recently?', 'social', 'any', 'starter', '2026-01-01T00:00:00.000Z');

-- Deepener openers (follow-ups when conversation stalls)
INSERT OR IGNORE INTO openers VALUES
  ('op_d01', 'What drew you to that in the first place?', 'any', 'any', 'deepener', '2026-01-01T00:00:00.000Z'),
  ('op_d02', 'What''s been the hardest part of navigating that?', 'any', 'any', 'deepener', '2026-01-01T00:00:00.000Z'),
  ('op_d03', 'What would a win look like for you there?', 'any', 'any', 'deepener', '2026-01-01T00:00:00.000Z'),
  ('op_d04', 'Who''s been the most useful person you''ve learned from in that area?', 'any', 'any', 'deepener', '2026-01-01T00:00:00.000Z'),
  ('op_d05', 'What''s the thing most people get wrong about that?', 'any', 'any', 'deepener', '2026-01-01T00:00:00.000Z');
