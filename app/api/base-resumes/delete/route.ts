import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/auth';
const { query } = require('@/lib/db/neon-server');

// DELETE /api/base-resumes/delete?id=xxx - Delete a base resume
export async function DELETE(request: NextRequest) {
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

    const result = await query(
      'DELETE FROM base_resumes WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error('Error deleting base resume:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
