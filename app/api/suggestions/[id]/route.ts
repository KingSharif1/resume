import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/neon';
import { verifyAuth } from '@/lib/auth/auth';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * PATCH /api/suggestions/[id]
 * Update a single suggestion's status
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { status } = body;

        if (!status || !['pending', 'accepted', 'dismissed'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const result = await db.query(
            `UPDATE ai_suggestions 
             SET status = $1, updated_at = NOW() 
             WHERE id = $2 AND user_id = $3
             RETURNING *`,
            [status, id, user.id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Suggestion not found' }, { status: 404 });
        }

        return NextResponse.json({ suggestion: result.rows[0] });
    } catch (error) {
        console.error('[Suggestion API] PATCH error:', error);
        return NextResponse.json({ error: 'Failed to update suggestion' }, { status: 500 });
    }
}

/**
 * DELETE /api/suggestions/[id]
 * Delete a single suggestion
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const result = await db.query(
            'DELETE FROM ai_suggestions WHERE id = $1 AND user_id = $2 RETURNING id',
            [id, user.id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Suggestion not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Suggestion API] DELETE error:', error);
        return NextResponse.json({ error: 'Failed to delete suggestion' }, { status: 500 });
    }
}
