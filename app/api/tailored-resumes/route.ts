import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/auth';
const { query } = require('@/lib/db/neon-server');

// GET /api/tailored-resumes - Get all tailored resumes for the authenticated user
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all tailored resumes for the user
    const result = await query(
      'SELECT * FROM resumes WHERE user_id = $1 AND type = \'tailored\' ORDER BY created_at DESC',
      [user.id]
    );

    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching tailored resumes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/tailored-resumes - Create a new tailored resume with AI
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { baseResumeId, jobDescription } = await request.json();

    if (!baseResumeId || !jobDescription) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 1. Fetch the base resume
    const baseResumeResult = await query(
      'SELECT * FROM resumes WHERE id = $1 AND user_id = $2 AND type = \'base\'',
      [baseResumeId, user.id]
    );

    if (baseResumeResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Base resume not found' },
        { status: 404 }
      );
    }

    const baseResume = baseResumeResult.rows[0];

    // 2. Use AI to analyze job description and tailor the resume
    const tailoredContent = await tailorResumeWithAI(baseResume, jobDescription);

    // 3. Calculate match score
    const matchScore = await calculateMatchScore(tailoredContent, jobDescription);

    // 4. Create the tailored resume in database
    const result = await query(
      `INSERT INTO resumes (
        user_id, type, source_resume_id, title, contact_info, summary, 
        experience, education, skills, certifications, projects, 
        custom_sections, job_description, match_score, settings
      ) VALUES ($1, 'tailored', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
      RETURNING *`,
      [
        user.id,
        baseResumeId,
        `${baseResume.title} - Tailored`,
        JSON.stringify(tailoredContent.contact_info || baseResume.contact_info),
        tailoredContent.summary || baseResume.summary,
        JSON.stringify(tailoredContent.experience || baseResume.experience),
        JSON.stringify(tailoredContent.education || baseResume.education),
        JSON.stringify(tailoredContent.skills || baseResume.skills),
        JSON.stringify(tailoredContent.certifications || baseResume.certifications),
        JSON.stringify(tailoredContent.projects || baseResume.projects),
        JSON.stringify(tailoredContent.custom_sections || baseResume.custom_sections),
        jobDescription,
        matchScore,
        JSON.stringify(baseResume.settings),
      ]
    );

    const tailoredResume = result.rows[0];

    // 5. Generate follow-up questions/suggestions for improvement
    const suggestions = await generateFollowUpQuestions(tailoredContent, jobDescription, matchScore);

    return NextResponse.json({
      tailoredResume,
      matchScore,
      suggestions
    });
  } catch (error: any) {
    console.error('Error creating tailored resume:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// AI function to tailor resume based on job description
async function tailorResumeWithAI(baseResume: any, jobDescription: string) {
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!openaiApiKey) {
    // Fallback: return base resume content if no AI available
    return {
      contact_info: baseResume.contact_info,
      summary: baseResume.summary,
      experience: baseResume.experience,
      education: baseResume.education,
      skills: baseResume.skills,
      certifications: baseResume.certifications,
      projects: baseResume.projects,
      custom_sections: baseResume.custom_sections
    };
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert resume optimizer. Given a base resume and a job description, optimize the resume to maximize the candidate's chances of getting the job. Focus on:
1. Highlighting relevant skills and experience
2. Using keywords from the job description
3. Quantifying achievements where possible
4. Tailoring the summary to match the role
5. Reordering bullet points to emphasize relevant experience
Return ONLY a valid JSON object with the optimized resume sections.`
          },
          {
            role: 'user',
            content: `Base Resume:\n${JSON.stringify(baseResume, null, 2)}\n\nJob Description:\n${jobDescription}\n\nOptimize this resume for the job. Return JSON with: summary, experience, education, skills`
          }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error('OpenAI API error');
    }

    const data = await response.json();
    const tailoredContent = JSON.parse(data.choices[0].message.content);

    return {
      contact_info: baseResume.contact_info,
      summary: tailoredContent.summary || baseResume.summary,
      experience: tailoredContent.experience || baseResume.experience,
      education: tailoredContent.education || baseResume.education,
      skills: tailoredContent.skills || baseResume.skills,
      certifications: baseResume.certifications,
      projects: baseResume.projects,
      custom_sections: baseResume.custom_sections
    };
  } catch (error) {
    console.error('Error with AI tailoring:', error);
    // Fallback to base resume
    return {
      contact_info: baseResume.contact_info,
      summary: baseResume.summary,
      experience: baseResume.experience,
      education: baseResume.education,
      skills: baseResume.skills,
      certifications: baseResume.certifications,
      projects: baseResume.projects,
      custom_sections: baseResume.custom_sections
    };
  }
}

// Calculate match score between resume and job description
async function calculateMatchScore(resume: any, jobDescription: string): Promise<number> {
  // Simple keyword matching for now (can be enhanced with AI)
  const resumeText = JSON.stringify(resume).toLowerCase();
  const jobWords = jobDescription.toLowerCase().split(/\W+/).filter(word => word.length > 3);
  
  const matches = jobWords.filter(word => resumeText.includes(word));
  const score = Math.min(Math.round((matches.length / jobWords.length) * 100), 100);
  
  return score;
}

// Generate follow-up questions to improve the tailored resume
async function generateFollowUpQuestions(resume: any, jobDescription: string, score: number) {
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!openaiApiKey || score >= 90) {
    return []; // No suggestions needed if score is high or no AI
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are a resume coach. Analyze the gap between this resume and job requirements. Generate 3-5 actionable questions to help improve the match. Questions should be specific and answerable.`
          },
          {
            role: 'user',
            content: `Resume:\n${JSON.stringify(resume, null, 2)}\n\nJob Description:\n${jobDescription}\n\nMatch Score: ${score}%\n\nGenerate improvement questions as a JSON array of strings.`
          }
        ],
        temperature: 0.8,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error('OpenAI API error');
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    
    return result.questions || [];
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return [];
  }
}
