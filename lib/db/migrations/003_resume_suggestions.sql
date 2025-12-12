-- Resume suggestions table
-- Stores AI-generated suggestions for resume optimization

CREATE TABLE IF NOT EXISTS resume_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID NOT NULL REFERENCES base_resumes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Suggestion details
  type TEXT NOT NULL CHECK (type IN ('wording', 'grammar', 'formatting', 'content', 'ats', 'impact')),
  severity TEXT NOT NULL CHECK (severity IN ('error', 'warning', 'suggestion')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'dismissed')),
  
  -- Target location
  target_section TEXT NOT NULL,
  target_item_id TEXT,
  target_field TEXT,
  
  -- Content
  original_text TEXT,
  suggested_text TEXT NOT NULL,
  reason TEXT,
  
  -- Position (for highlighting)
  start_offset INTEGER DEFAULT 0,
  end_offset INTEGER DEFAULT 0,
  
  -- Metadata
  source TEXT DEFAULT 'scan' CHECK (source IN ('scan', 'chat', 'manual')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_resume_suggestions_resume_id ON resume_suggestions(resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_suggestions_user_id ON resume_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_suggestions_status ON resume_suggestions(status);
