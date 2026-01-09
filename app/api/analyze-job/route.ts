import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface JobRequirement {
  category: 'skill' | 'experience' | 'education' | 'certification' | 'other';
  requirement: string;
  priority: 'required' | 'preferred' | 'nice-to-have';
  matched: boolean;
  matchedFrom?: string; // Where in the resume this was found
  suggestion?: string; // What to add/update if not matched
}

export interface JobAnalysis {
  jobTitle: string;
  company: string;
  requirements: JobRequirement[];
  matchScore: number;
  summary: string;
  keySkills: string[];
  missingSkills: string[];
  strengthsToHighlight: string[];
  suggestedChanges: {
    section: string;
    change: string;
    priority: 'high' | 'medium' | 'low';
  }[];
}

export async function POST(request: NextRequest) {
  try {
    const { jobDescription, resumeProfile } = await request.json();

    if (!jobDescription) {
      return NextResponse.json(
        { error: 'Job description is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Build resume context for comparison
    const resumeContext = resumeProfile ? buildResumeContext(resumeProfile) : '';

    const systemPrompt = `You are an expert career coach and resume analyst. Analyze the job description and ${resumeProfile ? 'compare it against the provided resume to identify matches and gaps' : 'extract key requirements'}.

Return a JSON object with this exact structure:
{
  "jobTitle": "extracted job title",
  "company": "company name if found, or 'Not specified'",
  "requirements": [
    {
      "category": "skill|experience|education|certification|other",
      "requirement": "specific requirement text",
      "priority": "required|preferred|nice-to-have",
      "matched": true/false,
      "matchedFrom": "where in resume this was found (if matched)",
      "suggestion": "what to add/update if not matched"
    }
  ],
  "matchScore": 0-100,
  "summary": "brief analysis of fit",
  "keySkills": ["skill1", "skill2"],
  "missingSkills": ["skill the candidate doesn't have"],
  "strengthsToHighlight": ["existing strengths that match the job"],
  "suggestedChanges": [
    {
      "section": "summary|experience|skills|education|projects",
      "change": "specific change to make",
      "priority": "high|medium|low"
    }
  ]
}

Be specific and actionable. Focus on what will make the biggest impact for the candidate.`;

    const userPrompt = `Job Description:
${jobDescription}

${resumeContext ? `Current Resume:
${resumeContext}` : 'No resume provided - just extract requirements from the job description.'}

Analyze this and provide the JSON response.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    const analysis: JobAnalysis = JSON.parse(content);

    return NextResponse.json({ success: true, analysis });

  } catch (error) {
    console.error('Job analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze job description' },
      { status: 500 }
    );
  }
}

function buildResumeContext(profile: any): string {
  const sections: string[] = [];

  // Contact/Name
  if (profile.contact?.fullName) {
    sections.push(`Name: ${profile.contact.fullName}`);
  }

  // Summary
  if (profile.summary?.content) {
    sections.push(`Summary: ${profile.summary.content}`);
  }

  // Skills
  if (profile.skills) {
    const allSkills: string[] = [];
    if (profile.skills.technical) allSkills.push(...profile.skills.technical);
    if (profile.skills.soft) allSkills.push(...profile.skills.soft);
    if (profile.skills.languages) allSkills.push(...profile.skills.languages);
    if (profile.skills.tools) allSkills.push(...profile.skills.tools);
    if (allSkills.length > 0) {
      sections.push(`Skills: ${allSkills.join(', ')}`);
    }
  }

  // Experience
  if (profile.experience?.length > 0) {
    const expText = profile.experience.map((exp: any) => 
      `${exp.title} at ${exp.company} (${exp.startDate} - ${exp.endDate || 'Present'}): ${exp.description || ''}`
    ).join('\n');
    sections.push(`Experience:\n${expText}`);
  }

  // Education
  if (profile.education?.length > 0) {
    const eduText = profile.education.map((edu: any) => 
      `${edu.degree} in ${edu.field} from ${edu.institution}`
    ).join('\n');
    sections.push(`Education:\n${eduText}`);
  }

  // Projects
  if (profile.projects?.length > 0) {
    const projText = profile.projects.map((proj: any) => 
      `${proj.name}: ${proj.description || ''}`
    ).join('\n');
    sections.push(`Projects:\n${projText}`);
  }

  // Certifications
  if (profile.certifications?.length > 0) {
    const certText = profile.certifications.map((cert: any) => 
      cert.name
    ).join(', ');
    sections.push(`Certifications: ${certText}`);
  }

  return sections.join('\n\n');
}
