import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// Initialize SQL safely - only if DATABASE_URL is provided
const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const resumeId = searchParams.get('resumeId');

    if (!resumeId || !sql) {
        return NextResponse.json({ messages: [] });
    }

    try {
        const messages = await sql`
            SELECT id, role, content, created_at 
            FROM resume_chat_messages 
            WHERE resume_id = ${resumeId} 
            ORDER BY created_at ASC
        `;
        
        return NextResponse.json({ messages });
    } catch (error) {
        console.error('Error fetching chat history:', error);
        // If table doesn't exist yet or other error, return empty array gracefully
        return NextResponse.json({ messages: [] });
    }
}
