import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/auth';
const { query } = require('@/lib/db/neon-server');

// GET /api/base-resumes - Get all base resumes for the authenticated user
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all base resumes for the user
    const result = await query(
      'SELECT * FROM base_resumes WHERE user_id = $1 ORDER BY updated_at DESC',
      [user.id]
    );

    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching base resumes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/base-resumes - Create a new base resume
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

    // Create the base resume
    const result = await query(
      `INSERT INTO base_resumes (
        user_id, title, content, sections, contact_info, summary, 
        experience, education, skills, certifications, projects, custom_sections
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
      RETURNING *`,
      [
        data.user_id,
        data.title,
        JSON.stringify(data.content || {}),
        JSON.stringify(data.sections || []),
        JSON.stringify(data.contact_info || {}),
        data.summary || '',
        JSON.stringify(data.experience || []),
        JSON.stringify(data.education || []),
        JSON.stringify(data.skills || {}),
        JSON.stringify(data.certifications || []),
        JSON.stringify(data.projects || []),
        JSON.stringify(data.custom_sections || []),
      ]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating base resume:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
