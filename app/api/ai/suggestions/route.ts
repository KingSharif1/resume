import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'mock-key',
  dangerouslyAllowBrowser: true
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { profile } = body;

        if (!profile) {
            return NextResponse.json({ suggestions: [] });
        }

        // Mock response if no API key
        if (!process.env.OPENAI_API_KEY) {
            // Generate contextual mock suggestions based on profile data
            const suggestions = [];
            
            // 1. Check for missing skills if mentioned in experience
            const expString = JSON.stringify(profile.experience || []).toLowerCase();
            const skillsString = JSON.stringify(profile.skills || {}).toLowerCase();
            
            if (expString.includes('react') && !skillsString.includes('react')) {
                suggestions.push({
                    id: Date.now(),
                    type: 'missing_skill',
                    title: "Add React",
                    description: "You mention using React in your experience, but it's missing from your Skills section.",
                    action: "add_skill",
                    data: { category: "Technical", skill: "React" }
                });
            }

            // 2. Check Summary length
            if (profile.summary?.content && profile.summary.content.length < 50) {
                suggestions.push({
                    id: Date.now() + 1,
                    type: 'improvement',
                    title: "Expand Summary",
                    description: "Your summary is quite short. A more detailed summary helps recruiters understand your goals.",
                    action: "update_summary",
                    data: { content: profile.summary.content + " Proven track record of delivering high-quality software solutions." }
                });
            }
            
            // 3. Generic improvement
            suggestions.push({
                id: Date.now() + 2,
                type: 'keyword',
                title: "Add 'Agile' Keyword",
                description: "Many roles in your field look for Agile methodology experience.",
                action: "add_skill",
                data: { category: "Methodologies", skill: "Agile" }
            });

            return NextResponse.json({ suggestions });
        }

        const systemPrompt = `Analyze the resume and provide 3 concrete, actionable suggestions to improve it.
        Return a JSON object with a key "suggestions" containing an array of objects.
        
        Each suggestion must have:
        - id: number
        - title: string (short, e.g. "Add TypeScript")
        - description: string (why? e.g. "You used it in project X")
        - type: "missing_skill" | "improvement" | "keyword"
        - action: "add_skill" | "update_summary" | "update_experience"
        - data: object (payload to apply the change)
        
        Actions:
        1. "add_skill": data = { category: string, skill: string }
        2. "update_summary": data = { content: string } (provide the FULL new summary)
        3. "update_experience": data = { id: string, description: string, achievements: string[] } (provide the FULL updated entry)
        
        Focus on:
        - Quantifying achievements
        - Matching target job keywords (if targetJob is present)
        - Fixing inconsistencies
        
        Resume: ${JSON.stringify(profile).substring(0, 3000)}`;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: systemPrompt }],
            model: "gpt-3.5-turbo",
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0].message.content;
        return NextResponse.json(JSON.parse(content || '{"suggestions": []}'));

    } catch (error: any) {
        console.error('Suggestions Error:', error);
        
        // Fallback to mock suggestions on error
        console.log('Falling back to Mock suggestions due to error');
        
        return NextResponse.json({ 
            suggestions: [
                {
                    id: Date.now(),
                    type: 'improvement',
                    title: "Quantify Achievements (Fallback)",
                    description: "The AI service is currently unavailable, but generally you should add numbers to your experience entries.",
                    action: "none", // No auto-action for fallback generic advice
                    data: {}
                },
                {
                    id: Date.now() + 1,
                    type: 'missing_skill',
                    title: "Check Key Skills",
                    description: "Ensure all technologies mentioned in your experience are also listed in your Skills section.",
                    action: "none",
                    data: {}
                }
            ]
        });
    }
}
