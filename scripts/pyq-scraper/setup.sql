-- ============================================================
-- PYQ Table Setup for FcuK Academia
-- Run once in the Supabase SQL Editor
-- ============================================================

-- 1. Create the main pyqs table
CREATE TABLE IF NOT EXISTS pyqs (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  semester      int         NOT NULL,
  subject_name  text        NOT NULL,   -- stored trimmed + lowercase
  subject_raw   text,                   -- original label from thehelpers (for debugging)
  exam_type     text,                   -- 'PYQ' | 'CT' | 'Other'
  year          int,                    -- extracted from label, nullable
  source_label  text,                   -- e.g. "PYQ Jul 2025"
  file_url      text        NOT NULL,   -- Supabase Storage public URL
  storage_path  text,                   -- path inside Storage bucket (for deletion)
  created_at    timestamptz DEFAULT now()
);

-- 2. Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_pyqs_semester         ON pyqs(semester);
CREATE INDEX IF NOT EXISTS idx_pyqs_subject          ON pyqs(subject_name);
CREATE INDEX IF NOT EXISTS idx_pyqs_semester_subject ON pyqs(semester, subject_name);

-- 3. Unique constraint to prevent duplicate inserts
--    ON CONFLICT (semester, subject_name, file_url) DO NOTHING
ALTER TABLE pyqs
  ADD CONSTRAINT unique_pyq UNIQUE (semester, subject_name, file_url);

-- 4. Row Level Security — public read, no client writes
ALTER TABLE pyqs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read" ON pyqs;
CREATE POLICY "public_read"
  ON pyqs
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 5. Storage bucket "pyqs" must be created manually in the Supabase Dashboard
--    Storage → New Bucket → Name: pyqs → Public: YES
--    Then add this policy in the Supabase Dashboard or run in SQL:

/*
-- Storage RLS (run separately if needed)
INSERT INTO storage.buckets (id, name, public)
  VALUES ('pyqs', 'pyqs', true)
  ON CONFLICT DO NOTHING;

CREATE POLICY "public_storage_read"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'pyqs');
*/
