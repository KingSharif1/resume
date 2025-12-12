import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/neon';
import { verifyAuth } from '@/lib/auth/auth';

/**
 * GET /api/suggestions?resumeId=xxx
 * Fetch all suggestions for a resume
 */
export async function GET(request: NextRequest) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const resumeId = request.nextUrl.searchParams.get('resumeId');
        if (!resumeId) {
            return NextResponse.json({ error: 'resumeId is required' }, { status: 400 });
        }

        const result = await db.query(
            `SELECT * FROM ai_suggestions 
             WHERE (tailored_resume_id = $1 OR base_resume_id = $1) AND user_id = $2 
             ORDER BY created_at DESC`,
            [resumeId, user.id]
        );

        return NextResponse.json({ suggestions: result.rows });
    } catch (error: any) {
        console.error('[Suggestions API] GET error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        return NextResponse.json({ error: 'Failed to fetch suggestions', details: error.message }, { status: 500 });
    }
}

/**
 * POST /api/suggestions
 * Save suggestions for a resume (replaces existing)
 */
export async function POST(request: NextRequest) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { resumeId, suggestions } = body;

        if (!resumeId || !Array.isArray(suggestions)) {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }

        // Start transaction - delete existing and insert new
        await db.query('BEGIN');


        try {
            // Determine resume type
            let targetColumn = 'tailored_resume_id';
            const tailoredCheck = await db.query('SELECT id FROM tailored_resumes WHERE id = $1', [resumeId]);
            
            if (tailoredCheck.rows.length === 0) {
                const baseCheck = await db.query('SELECT id FROM base_resumes WHERE id = $1', [resumeId]);
                if (baseCheck.rows.length === 0) {
                     return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
                }
                targetColumn = 'base_resume_id';
            }

            // First, delete existing suggestions for this resume
            await db.query(`DELETE FROM ai_suggestions WHERE ${targetColumn} = $1`, [resumeId]);

            if (suggestions.length === 0) {
                await db.query('COMMIT');
                return NextResponse.json({ success: true });
            }

            // Insert new suggestions
            for (const s of suggestions) {
                await db.query(
                    `INSERT INTO ai_suggestions (
                        ${targetColumn}, user_id, type, severity, status,
                        target_section, target_item_id, target_field,
                        original_text, suggested_text, reason,
                        start_offset, end_offset, source
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
                    [
                        resumeId,
                        user.id,
                        s.type || 'wording',
                        s.severity || 'suggestion',
                        s.status || 'pending',
                        s.target_section,
                        s.target_item_id || null,
                        s.target_field || null,
                        s.original_text || null,
                        s.suggested_text,
                        s.reason || null,
                        s.start_offset || 0,
                        s.end_offset || 0,
                        s.source || 'scan'
                    ]
                );
            }

            await db.query('COMMIT');
            return NextResponse.json({ success: true, count: suggestions.length });
        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }
    } catch (error: any) {
        // Handle foreign key violation (resume not found)
        if (error.code === '23503') {
            console.log('[Suggestions API] Resume not found in DB, skipping save');
            return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
        }

        console.error('[Suggestions API] POST error:', error);
        return NextResponse.json({ error: 'Failed to save suggestions' }, { status: 500 });
    }
}

/**
 * DELETE /api/suggestions?resumeId=xxx
 * Delete all suggestions for a resume
 */
export async function DELETE(request: NextRequest) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const resumeId = request.nextUrl.searchParams.get('resumeId');
        if (!resumeId) {
            return NextResponse.json({ error: 'resumeId is required' }, { status: 400 });
        }

        await db.query(
            'DELETE FROM ai_suggestions WHERE (tailored_resume_id = $1 OR base_resume_id = $1) AND user_id = $2',
            [resumeId, user.id]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Suggestions API] DELETE error:', error);
        return NextResponse.json({ error: 'Failed to delete suggestions' }, { status: 500 });
    }
}
