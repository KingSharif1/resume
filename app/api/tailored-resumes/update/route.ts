import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/auth';
const { query } = require('@/lib/db/neon-server');

// PUT /api/tailored-resumes/update?id=xxx - Update a tailored resume
export async function PUT(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get ID from query parameter
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Resume ID is required' }, { status: 400 });
    }

    const data = await request.json();
    
    // Build the SET part of the query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Fetch existing content if we need to merge
    let currentContent: any = {};
    if (data.tailored_content || data.original_content) {
         const existing = await query('SELECT content FROM resumes WHERE id = $1', [id]);
         if (existing.rows.length > 0) {
             currentContent = existing.rows[0].content;
         }
    }

    if (data.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(data.title);
    }
    
    if (data.tailored_content !== undefined) {
         currentContent = { ...currentContent, ...data.tailored_content };
    }
    if (data.original_content !== undefined) {
         currentContent.original_content_text = data.original_content;
    }
    
    if (data.tailored_content !== undefined || data.original_content !== undefined) {
        updates.push(`content = $${paramIndex++}`);
        values.push(JSON.stringify(currentContent));
    }

    if (data.job_description !== undefined) {
      updates.push(`target_job_description = $${paramIndex++}`);
      values.push(data.job_description);
    }

    if (data.score !== undefined) {
      updates.push(`score = $${paramIndex++}`);
      values.push(data.score);
    }
    if (data.score_breakdown !== undefined) {
      updates.push(`score_breakdown = $${paramIndex++}`);
      values.push(JSON.stringify(data.score_breakdown));
    }

    // Always update the updated_at timestamp
    updates.push(`updated_at = NOW()`);

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Add the WHERE clause parameters
    values.push(id);
    values.push(user.id);

    const result = await query(
      `UPDATE resumes SET ${updates.join(', ')} 
       WHERE id = $${paramIndex++} AND user_id = $${paramIndex++}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating tailored resume:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
