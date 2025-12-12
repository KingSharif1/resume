import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/auth';
const { query } = require('@/lib/db/neon-server');

// GET /api/tailored-resumes/get-by-id?id=xxx - Get a single tailored resume
export async function GET(request: NextRequest) {
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
      'SELECT * FROM tailored_resumes WHERE id = $1 AND user_id = $2',
      [id, user.id]
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
