import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { ResumeProfile } from '@/lib/resume-schema';

const sql = neon(process.env.NEON_DATABASE_URL!);

// GET - List user's base resumes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const resumes = await sql`
      SELECT id, title, created_at, updated_at, 
             contact_info, summary, experience, education, 
             skills, certifications, projects, custom_sections, is_starred
      FROM base_resumes 
      WHERE user_id = ${userId}
      ORDER BY updated_at DESC
    `;

    return NextResponse.json({ resumes });
  } catch (error) {
    console.error('Error fetching resumes:', error);
    return NextResponse.json({ error: 'Failed to fetch resumes' }, { status: 500 });
  }
}

// POST - Create new base resume
export async function POST(request: NextRequest) {
  try {
    const { profile, userId } = await request.json();

    if (!profile || !userId) {
      return NextResponse.json({ error: 'Profile and user ID are required' }, { status: 400 });
    }

    // Generate title from profile
    const title = `${profile.contact?.firstName || 'Untitled'} ${profile.contact?.lastName || 'Resume'}`.trim();

    const result = await sql`
      INSERT INTO base_resumes (
        user_id, title, contact_info, summary, experience, 
        education, skills, certifications, projects, custom_sections
      )
      VALUES (
        ${userId}, 
        ${title}, 
        ${JSON.stringify(profile.contact)},
        ${profile.summary?.content || null},
        ${JSON.stringify(profile.experience)},
        ${JSON.stringify(profile.education)},
        ${JSON.stringify(profile.skills)},
        ${JSON.stringify(profile.certifications)},
        ${JSON.stringify(profile.projects)},
        ${JSON.stringify(profile.customSections)}
      )
      RETURNING id, title, created_at, updated_at
    `;

    return NextResponse.json({ 
      id: result[0].id,
      title: result[0].title,
      created_at: result[0].created_at,
      updated_at: result[0].updated_at
    });
  } catch (error) {
    console.error('Error creating resume:', error);
    return NextResponse.json({ error: 'Failed to create resume' }, { status: 500 });
  }
}

// PUT - Update existing base resume
export async function PUT(request: NextRequest) {
  try {
    const { id, profile, userId } = await request.json();

    if (!id || !profile || !userId) {
      return NextResponse.json({ error: 'ID, profile, and user ID are required' }, { status: 400 });
    }

    // Generate title from profile
    const title = `${profile.contact?.firstName || 'Untitled'} ${profile.contact?.lastName || 'Resume'}`.trim();

    const result = await sql`
      UPDATE base_resumes 
      SET 
        title = ${title},
        contact_info = ${JSON.stringify(profile.contact)},
        summary = ${profile.summary?.content || null},
        experience = ${JSON.stringify(profile.experience)},
        education = ${JSON.stringify(profile.education)},
        skills = ${JSON.stringify(profile.skills)},
        certifications = ${JSON.stringify(profile.certifications)},
        projects = ${JSON.stringify(profile.projects)},
        custom_sections = ${JSON.stringify(profile.customSections)},
        updated_at = NOW()
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id, title, updated_at
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Resume not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({
      id: result[0].id,
      title: result[0].title,
      updated_at: result[0].updated_at
    });
  } catch (error) {
    console.error('Error updating resume:', error);
    return NextResponse.json({ error: 'Failed to update resume' }, { status: 500 });
  }
}

// DELETE - Delete base resume
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!id || !userId) {
      return NextResponse.json({ error: 'ID and user ID are required' }, { status: 400 });
    }

    const result = await sql`
      DELETE FROM base_resumes 
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Resume not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting resume:', error);
    return NextResponse.json({ error: 'Failed to delete resume' }, { status: 500 });
  }
}
