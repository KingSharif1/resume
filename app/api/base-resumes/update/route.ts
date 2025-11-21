import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/auth';
const { query } = require('@/lib/db/neon-server');

// PUT /api/base-resumes/update?id=xxx - Update a base resume
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

    if (data.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(data.title);
    }
    if (data.content !== undefined) {
      updates.push(`content = $${paramIndex++}`);
      values.push(JSON.stringify(data.content));
    }
    if (data.sections !== undefined) {
      updates.push(`sections = $${paramIndex++}`);
      values.push(JSON.stringify(data.sections));
    }
    if (data.contact_info !== undefined) {
      updates.push(`contact_info = $${paramIndex++}`);
      values.push(JSON.stringify(data.contact_info));
    }
    if (data.summary !== undefined) {
      updates.push(`summary = $${paramIndex++}`);
      values.push(data.summary);
    }
    if (data.experience !== undefined) {
      updates.push(`experience = $${paramIndex++}`);
      values.push(JSON.stringify(data.experience));
    }
    if (data.education !== undefined) {
      updates.push(`education = $${paramIndex++}`);
      values.push(JSON.stringify(data.education));
    }
    if (data.skills !== undefined) {
      updates.push(`skills = $${paramIndex++}`);
      values.push(JSON.stringify(data.skills));
    }
    if (data.certifications !== undefined) {
      updates.push(`certifications = $${paramIndex++}`);
      values.push(JSON.stringify(data.certifications));
    }
    if (data.projects !== undefined) {
      updates.push(`projects = $${paramIndex++}`);
      values.push(JSON.stringify(data.projects));
    }
    if (data.custom_sections !== undefined) {
      updates.push(`custom_sections = $${paramIndex++}`);
      values.push(JSON.stringify(data.custom_sections));
    }
    if (data.is_starred !== undefined) {
      updates.push(`is_starred = $${paramIndex++}`);
      values.push(data.is_starred);
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
      `UPDATE base_resumes SET ${updates.join(', ')} 
       WHERE id = $${paramIndex++} AND user_id = $${paramIndex++}
       RETURNING *`,
      values
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
