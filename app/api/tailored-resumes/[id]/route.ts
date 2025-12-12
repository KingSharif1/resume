import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/auth';
const { query } = require('@/lib/db/neon-server');

// GET /api/tailored-resumes/[id] - Get a single tailored resume
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await query(
      'SELECT * FROM tailored_resumes WHERE id = $1 AND user_id = $2',
      [params.id, user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error fetching tailored resume:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/tailored-resumes/[id] - Update a tailored resume
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // Build the SET part of the query dynamically based on provided fields
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(data.title);
    }
    if (data.original_content !== undefined) {
      updates.push(`original_content = $${paramIndex++}`);
      values.push(data.original_content);
    }
    if (data.job_description !== undefined) {
      updates.push(`job_description = $${paramIndex++}`);
      values.push(data.job_description);
    }
    if (data.tailored_content !== undefined) {
      updates.push(`tailored_content = $${paramIndex++}`);
      values.push(JSON.stringify(data.tailored_content));
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
    values.push(params.id);
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

// DELETE /api/tailored-resumes/[id] - Delete a tailored resume
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await query(
      'DELETE FROM resumes WHERE id = $1 AND user_id = $2',
      [params.id, user.id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting tailored resume:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
