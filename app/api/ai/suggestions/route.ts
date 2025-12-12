import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ResumeProfile } from '@/lib/resume-schema';
import { verifyAuth } from '@/lib/auth/auth';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'mock-key',
    dangerouslyAllowBrowser: true
});

/**
 * Build comprehensive resume context for AI analysis
 */
function buildResumeContext(profile: ResumeProfile): string {
    const sections = [];

    // Contact
    if (profile.contact) {
        sections.push(`## CONTACT
Name: ${profile.contact.firstName || ''} ${profile.contact.lastName || ''}
Email: ${profile.contact.email || 'Not provided'}
Phone: ${profile.contact.phone || 'Not provided'}
Location: ${profile.contact.location || 'Not provided'}
LinkedIn: ${profile.contact.linkedin || 'Not provided'}
GitHub: ${profile.contact.github || 'Not provided'}`);
    }

    // Summary
    if (profile.summary?.content) {
        sections.push(`## PROFESSIONAL SUMMARY
${profile.summary.content}`);
    }

    // Experience
    if (profile.experience?.length > 0) {
        const expText = profile.experience.map((exp, i) => `
### Experience ${i + 1}: ${exp.position} at ${exp.company}
Location: ${exp.location || 'N/A'}
Period: ${exp.startDate} - ${exp.current ? 'Present' : exp.endDate || 'N/A'}
Description: ${exp.description || 'N/A'}
Achievements: 
${exp.achievements?.map(a => `  • ${a}`).join('\n') || '  (none listed)'}`).join('\n');
        sections.push(`## WORK EXPERIENCE (${profile.experience.length} entries)${expText}`);
    }

    // Education
    if (profile.education?.length > 0) {
        const eduText = profile.education.map(edu => 
            `- ${edu.degree} in ${edu.fieldOfStudy || 'N/A'} from ${edu.institution}`
        ).join('\n');
        sections.push(`## EDUCATION\n${eduText}`);
    }

    // Skills
    if (profile.skills && Object.keys(profile.skills).length > 0) {
        const skillsText = Object.entries(profile.skills)
            .map(([cat, skills]) => `${cat}: ${(skills as string[]).join(', ')}`)
            .join('\n');
        sections.push(`## SKILLS\n${skillsText}`);
    }

    // Projects
    if (profile.projects?.length > 0) {
        const projText = profile.projects.map(p => 
            `- ${p.name}: ${p.description || 'No description'}`
        ).join('\n');
        sections.push(`## PROJECTS\n${projText}`);
    }

    // Certifications
    if (profile.certifications?.length > 0) {
        const certText = profile.certifications.map(c => `- ${c.name}`).join('\n');
        sections.push(`## CERTIFICATIONS\n${certText}`);
    }

    return sections.join('\n\n');
}

export async function POST(request: NextRequest) {
    try {
        // Verify authentication
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { profile } = body;

        if (!profile) {
            return NextResponse.json({ suggestions: [] });
        }

        // Mock response if no API key
        if (!process.env.OPENAI_API_KEY) {
            const suggestions = generateMockSuggestions(profile);
            return NextResponse.json({ suggestions });
        }

        // Build comprehensive resume context
        const resumeContext = buildResumeContext(profile);

        const systemPrompt = `You are an expert ATS resume optimizer. Analyze this resume and provide specific, actionable suggestions.

## RULES:
1. Each suggestion must target SPECIFIC text that can be highlighted
2. Provide the EXACT original text and the improved version
3. Focus on ATS optimization: keywords, metrics, action verbs
4. Do NOT suggest the same type of improvement twice on the same section
5. Maximum 5 suggestions, prioritize highest impact

## OUTPUT FORMAT (JSON):
{
    "suggestions": [
        {
            "targetSection": "summary" | "experience" | "education" | "skills" | "projects",
            "targetItemId": "optional - ID if targeting specific item",
            "targetField": "description" | "achievements" | "content",
            "originalText": "EXACT text to replace (copy from resume)",
            "suggestedText": "Improved version with metrics, action verbs, keywords",
            "reason": "Brief explanation of why this is better",
            "type": "wording" | "grammar" | "metric" | "ats",
            "severity": "suggestion" | "warning" | "error",
            "priority": 1-5
        }
    ]
}

## FOCUS AREAS:
- Add quantified metrics (numbers, percentages, dollar amounts)
- Replace weak verbs with strong action verbs (Led, Implemented, Drove)
- Add industry keywords for ATS matching
- Remove passive voice
- Ensure consistency in formatting

## RESUME TO ANALYZE:
${resumeContext}`;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: systemPrompt }],
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
            temperature: 0.7
        });

        const content = completion.choices[0].message.content;
        const parsed = JSON.parse(content || '{"suggestions": []}');
        
        // Deduplicate suggestions
        const seenKeys = new Set<string>();
        const uniqueSuggestions = (parsed.suggestions || []).filter((s: any) => {
            const key = `${s.targetSection}:${s.originalText?.slice(0, 30)}`;
            if (seenKeys.has(key)) return false;
            seenKeys.add(key);
            return true;
        });

        return NextResponse.json({ suggestions: uniqueSuggestions });

    } catch (error: any) {
        console.error('Suggestions Error:', error);
        
        // Fallback to mock suggestions on error
        return NextResponse.json({ 
            suggestions: generateMockSuggestions(null),
            error: 'AI service unavailable, showing sample suggestions'
        });
    }
}

/**
 * Generate contextual mock suggestions when API is unavailable
 */
function generateMockSuggestions(profile: ResumeProfile | null): any[] {
    const suggestions = [];

    if (profile) {
        // Check summary length
        if (profile.summary?.content && profile.summary.content.length < 100) {
            suggestions.push({
                targetSection: 'summary',
                targetField: 'content',
                originalText: profile.summary.content.slice(0, 50),
                suggestedText: profile.summary.content + ' Proven track record of delivering results and driving business growth.',
                reason: 'Expand your summary to highlight key achievements and value proposition.',
                type: 'wording',
                severity: 'suggestion'
            });
        }

        // Check for metrics in experience
        if (profile.experience?.length > 0) {
            const exp = profile.experience[0];
            if (exp.description && !/\d+/.test(exp.description)) {
                suggestions.push({
                    targetSection: 'experience',
                    targetItemId: exp.id,
                    targetField: 'description',
                    originalText: exp.description.slice(0, 80),
                    suggestedText: exp.description.replace(
                        /improved|increased|reduced|managed/gi, 
                        (m) => `${m} by 25%`
                    ),
                    reason: 'Add specific metrics to quantify your impact.',
                    type: 'metric',
                    severity: 'warning'
                });
            }
        }

        // Check skills
        const totalSkills = Object.values(profile.skills || {}).flat().length;
        if (totalSkills < 8) {
            suggestions.push({
                targetSection: 'skills',
                targetField: 'skills',
                originalText: 'Current skills section',
                suggestedText: 'Add 5-10 more relevant technical skills for better ATS matching.',
                reason: 'ATS systems scan for keyword density. More relevant skills = higher match rate.',
                type: 'ats',
                severity: 'suggestion'
            });
        }
    } else {
        // Generic fallback suggestions
        suggestions.push({
            targetSection: 'experience',
            targetField: 'description',
            originalText: 'Your experience description',
            suggestedText: 'Led cross-functional team of 5 engineers, delivering projects 20% ahead of schedule.',
            reason: 'Add quantified achievements with specific numbers.',
            type: 'metric',
            severity: 'suggestion'
        });
    }

    return suggestions;
}
