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
      'SELECT * FROM resumes WHERE user_id = $1 AND type = \'base\' ORDER BY updated_at DESC',
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
    const content = {
        summary: data.summary || '',
        contact_info: data.contact_info || {},
        experience: data.experience || [],
        education: data.education || [],
        skills: data.skills || {},
        projects: data.projects || [],
        certifications: data.certifications || [],
        custom_sections: data.custom_sections || []
    };

    const result = await query(
      `INSERT INTO resumes (
        user_id, type, title, content, is_starred, settings
      ) VALUES ($1, 'base', $2, $3, $4, $5) 
      RETURNING *`,
      [
        data.user_id,
        data.title,
        JSON.stringify(content),
        false,
        JSON.stringify(data.settings || {})
      ]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating base resume:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
