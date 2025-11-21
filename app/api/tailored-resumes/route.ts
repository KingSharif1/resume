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
      'SELECT * FROM resumes WHERE user_id = $1 ORDER BY created_at DESC',
      [user.id]
    );

    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching tailored resumes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/tailored-resumes - Create a new tailored resume
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const data = await request.json();
    
    // Ensure user_id matches the authenticated user
    data.user_id = user.id;

    // Create the tailored resume
    const result = await query(
      `INSERT INTO resumes (
        user_id, base_resume_id, title, original_content, job_description, 
        tailored_content, score, score_breakdown
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *`,
      [
        data.user_id,
        data.base_resume_id || null,
        data.title,
        data.original_content || '',
        data.job_description || '',
        JSON.stringify(data.tailored_content),
        data.score || null,
        JSON.stringify(data.score_breakdown || null),
      ]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating tailored resume:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
