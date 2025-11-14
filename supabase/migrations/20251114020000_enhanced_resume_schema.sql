/*
  # Enhanced Resume Tailor Schema

  1. Changes to Tables
    - Drop existing `resumes` table
    - Create `base_resumes` table for storing user's master resumes
      - `id` (uuid, primary key)
      - `user_id` (uuid) - References auth.users
      - `title` (text) - Resume name
      - `contact_info` (jsonb) - Name, email, phone, location, links
      - `summary` (text) - Professional summary
      - `experience` (jsonb[]) - Array of work experiences
      - `education` (jsonb[]) - Array of education entries
      - `skills` (jsonb) - Categorized skills
      - `certifications` (jsonb[]) - Array of certifications
      - `projects` (jsonb[]) - Array of projects
      - `custom_sections` (jsonb[]) - Additional sections
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - Create `tailored_resumes` table for AI-generated versions
      - `id` (uuid, primary key)
      - `user_id` (uuid) - References auth.users
      - `base_resume_id` (uuid) - References base_resumes
      - `job_title` (text) - Target job title
      - `job_description` (text) - Job posting
      - `tailored_content` (jsonb) - Modified resume
      - `ai_changes` (jsonb[]) - Array of changes with explanations
      - `ai_suggestions` (jsonb[]) - Improvement recommendations
      - `template_id` (text) - Which template used
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

DROP TABLE IF EXISTS resumes;

CREATE TABLE IF NOT EXISTS base_resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL DEFAULT 'My Resume',
  contact_info jsonb DEFAULT '{"name": "", "email": "", "phone": "", "location": "", "linkedin": "", "portfolio": ""}'::jsonb,
  summary text DEFAULT '',
  experience jsonb[] DEFAULT ARRAY[]::jsonb[],
  education jsonb[] DEFAULT ARRAY[]::jsonb[],
  skills jsonb DEFAULT '{}'::jsonb,
  certifications jsonb[] DEFAULT ARRAY[]::jsonb[],
  projects jsonb[] DEFAULT ARRAY[]::jsonb[],
  custom_sections jsonb[] DEFAULT ARRAY[]::jsonb[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tailored_resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  base_resume_id uuid REFERENCES base_resumes(id) ON DELETE CASCADE,
  job_title text NOT NULL DEFAULT 'Untitled Position',
  job_description text NOT NULL,
  tailored_content jsonb NOT NULL,
  ai_changes jsonb[] DEFAULT ARRAY[]::jsonb[],
  ai_suggestions jsonb[] DEFAULT ARRAY[]::jsonb[],
  template_id text DEFAULT 'modern',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE base_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tailored_resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own base resumes"
  ON base_resumes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own base resumes"
  ON base_resumes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own base resumes"
  ON base_resumes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own base resumes"
  ON base_resumes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own tailored resumes"
  ON tailored_resumes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tailored resumes"
  ON tailored_resumes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tailored resumes"
  ON tailored_resumes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tailored resumes"
  ON tailored_resumes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS base_resumes_user_id_idx ON base_resumes(user_id);
CREATE INDEX IF NOT EXISTS base_resumes_updated_at_idx ON base_resumes(updated_at DESC);
CREATE INDEX IF NOT EXISTS tailored_resumes_user_id_idx ON tailored_resumes(user_id);
CREATE INDEX IF NOT EXISTS tailored_resumes_base_resume_id_idx ON tailored_resumes(base_resume_id);
CREATE INDEX IF NOT EXISTS tailored_resumes_created_at_idx ON tailored_resumes(created_at DESC);
