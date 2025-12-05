-- Migration: Add settings, target_job, and is_starred to base_resumes

ALTER TABLE base_resumes ADD COLUMN IF NOT EXISTS settings JSONB;
ALTER TABLE base_resumes ADD COLUMN IF NOT EXISTS target_job TEXT;
ALTER TABLE base_resumes ADD COLUMN IF NOT EXISTS is_starred BOOLEAN DEFAULT FALSE;
