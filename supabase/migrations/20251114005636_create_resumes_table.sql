/*
  # Resume Tailor Database Schema

  1. New Tables
    - `resumes`
      - `id` (uuid, primary key) - Unique identifier for each resume
      - `user_id` (uuid) - References auth.users
      - `title` (text) - Resume title/name
      - `original_content` (text) - Base resume content
      - `job_description` (text) - Job description used for tailoring
      - `tailored_content` (jsonb) - Structured tailored resume output
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `resumes` table
    - Add policy for authenticated users to read their own resumes
    - Add policy for authenticated users to insert their own resumes
    - Add policy for authenticated users to update their own resumes
    - Add policy for authenticated users to delete their own resumes
*/

CREATE TABLE IF NOT EXISTS resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL DEFAULT 'Untitled Resume',
  original_content text NOT NULL,
  job_description text NOT NULL,
  tailored_content jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own resumes"
  ON resumes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resumes"
  ON resumes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resumes"
  ON resumes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own resumes"
  ON resumes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS resumes_user_id_idx ON resumes(user_id);
CREATE INDEX IF NOT EXISTS resumes_created_at_idx ON resumes(created_at DESC);