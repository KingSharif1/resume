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

        const { profile, regenerateContext } = await request.json();
        
        if (!profile) {
            return NextResponse.json({ error: 'Profile is required' }, { status: 400 });
        }

        // Mock response if no API key
        if (!process.env.OPENAI_API_KEY) {
            const suggestions = generateMockSuggestions(profile);
            return NextResponse.json({ suggestions });
        }

        const resumeContext = buildResumeContext(profile);
        
        // Handle regeneration with smart defaults
        let regenerationInstructions = '';
        if (regenerateContext) {
            const { suggestionType, userPrompt, previousSuggestion, originalText, targetSection, targetField } = regenerateContext;
            
            regenerationInstructions = `\n\n## REGENERATION MODE - IMPORTANT
You are regenerating a suggestion for: ${targetSection}${targetField ? ` (${targetField})` : ''}
Original text: "${originalText}"
Previous suggestion: "${previousSuggestion}"

${userPrompt ? `User's specific request: "${userPrompt}"` : `
**No user prompt provided - Use creative variation based on suggestion type:**

${suggestionType === 'wording' ? `
- Try DIFFERENT synonyms or alternative phrasing
- Experiment with different tones (professional, dynamic, technical)
- Vary sentence structure while keeping the same meaning
- Example: "Led team" → "Spearheaded team" or "Directed team" or "Orchestrated team efforts"
` : ''}

${suggestionType === 'metric' ? `
- Suggest DIFFERENT numbers, percentages, or quantifications
- Try alternative ways to measure impact (time saved, revenue, efficiency %)
- Example: "Improved by 25%" → "Reduced costs by $50K" or "Accelerated delivery by 3 weeks"
` : ''}

${suggestionType === 'ats' ? `
- Suggest DIFFERENT industry keywords or technical terms
- Try alternative skill names or certifications
- Focus on different aspects of the same technology
` : ''}

${suggestionType === 'grammar' || suggestionType === 'tone' ? `
- Fix the same issue but with a different stylistic approach
- Try alternative sentence structures
` : ''}
`}

**CRITICAL**: Your new suggestion MUST be meaningfully different from the previous one. Don't just repeat the same suggestion.
Focus ONLY on this specific section. Provide exactly 1 suggestion.`;
        }

        const systemPrompt = `You are an expert ATS resume optimizer. Analyze this resume and provide specific, actionable suggestions.

## CRITICAL RULES:
1. Each suggestion must target SPECIFIC text that can be highlighted
2. Provide the EXACT original text and the improved version
3. **IMPORTANT: When adding content (metrics, keywords), ONLY include the NEW parts in suggestedText, not the entire sentence**
   - BAD: originalText: "Developed software" → suggestedText: "Developed and maintained high-performance software"
   - GOOD: originalText: "Developed software" → suggestedText: "Developed and maintained high-performance software" (keep full context for clarity)
   - For skills: originalText: "Git, GitHub" → suggestedText: "Git, GitHub, Docker, Kubernetes" (show full list)
4. **SKILLS SECTION RULES:**
   - ALWAYS include the category name in BOTH originalText and suggestedText
   - Format: "Category: skill1, skill2, skill3"
   - Example: originalText: "Tools: Git, GitHub, Heroku" → suggestedText: "Tools: Git, GitHub, Heroku, Docker, Kubernetes"
   - targetItemId MUST be the category name (e.g., "Tools", "Languages", "Deployment")
   - When comparing skills, only suggest additions within the SAME category
   - Do NOT mix skills from different categories
5. **EDUCATION SECTION RULES:**
   - Education is displayed as: "Degree in Field of Study from Institution"
   - Example: "B.S. in Computer Science from Harvard University"
   - If you see redundancy like "B.S. in Computer Science in Computer Science", this means:
     * The degree field contains: "B.S. in Computer Science"
     * The field of study contains: "Computer Science"
     * This creates the duplicate "in Computer Science"
   - When suggesting fixes for redundancy, EXPLAIN THE ROOT CAUSE in the reason
   - Example reason: "The degree field 'B.S. in Computer Science' already includes the field of study, causing 'in Computer Science' to appear twice. Simplifying to 'B.S.' removes the redundancy."
6. **REASON FIELD REQUIREMENTS:**
   - Always explain WHY the issue exists, not just what to fix
   - For redundancy: Identify which fields are causing the duplication
   - For missing metrics: Explain what impact the metric would show
   - For weak verbs: Explain why the new verb is stronger
   - For ATS keywords: Explain which job requirements the keyword addresses
   - Be specific and educational, not generic
7. Focus on ATS optimization: keywords, metrics, action verbs
8. Do NOT suggest the same type of improvement twice on the same section
9. Maximum 5 suggestions, prioritize highest impact
10. When suggesting word replacements, keep surrounding text unchanged

## OUTPUT FORMAT (JSON):
{
    "suggestions": [
        {
            "targetSection": "summary" | "experience" | "education" | "skills" | "projects",
            "targetItemId": "REQUIRED for skills (category name like 'Tools'), optional for other sections (item ID)",
            "targetField": "description" | "achievements" | "content" | null (for skills)",
            "originalText": "EXACT text to replace (copy from resume) - can be partial sentence. For skills: MUST include 'Category: skill1, skill2'",
            "suggestedText": "Improved version - keep unchanged parts identical, only modify what needs changing. For skills: MUST include 'Category: skill1, skill2, newskill3'",
            "reason": "Brief explanation of why this is better",
            "type": "wording" | "grammar" | "metric" | "ats" | "tone" | "formatting",
            "severity": "suggestion" | "warning" | "error",
            "priority": 1-5
        }
    ]
}

## SKILLS SUGGESTION EXAMPLE:
{
    "targetSection": "skills",
    "targetItemId": "Tools",
    "targetField": null,
    "originalText": "Tools: Git, GitHub, Heroku",
    "suggestedText": "Tools: Git, GitHub, Heroku, Docker, Kubernetes",
    "reason": "Adding Docker and Kubernetes enhances DevOps skill visibility for ATS",
    "type": "ats",
    "severity": "suggestion",
    "priority": 3
}

## FOCUS AREAS:
- Add quantified metrics (numbers, percentages, dollar amounts)
- Replace weak verbs with strong action verbs (Led, Implemented, Drove, Engineered)
- Add industry keywords for ATS matching
- Remove passive voice
- Ensure consistency in formatting

## RESUME TO ANALYZE:
${resumeContext}
${regenerationInstructions}`;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: systemPrompt }],
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
            temperature: regenerateContext ? 0.9 : 0.7  // Higher temperature for more creative variations
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
