import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/auth';
const { query } = require('@/lib/db/neon-server');

// GET /api/base-resumes/[id] - Get a specific base resume
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the base resume
    const result = await query(
      'SELECT * FROM base_resumes WHERE id = $1 AND user_id = $2',
      [params.id, user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error fetching base resume:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/base-resumes/[id] - Update a base resume
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Update the base resume
    const result = await query(
      `UPDATE base_resumes SET 
        title = $1, 
        content = $2, 
        sections = $3, 
        contact_info = $4, 
        summary = $5, 
        experience = $6, 
        education = $7, 
        skills = $8, 
        certifications = $9, 
        projects = $10, 
        custom_sections = $11,
        is_starred = $12,
        updated_at = NOW()
      WHERE id = $13 AND user_id = $14
      RETURNING *`,
      [
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
        data.is_starred !== undefined ? data.is_starred : false,
        params.id,
        user.id
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating base resume:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/base-resumes/[id] - Delete a base resume
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete the base resume
    const result = await query(
      'DELETE FROM base_resumes WHERE id = $1 AND user_id = $2 RETURNING id',
      [params.id, user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, id: params.id });
  } catch (error: any) {
    console.error('Error deleting base resume:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
