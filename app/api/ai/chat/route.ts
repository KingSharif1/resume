import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { neon } from '@neondatabase/serverless';

// Initialize SQL safely
const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

// Initialize OpenAI (mock if no key for development)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'mock-key',
  dangerouslyAllowBrowser: true 
});

// Define Suggestion Structure
interface AISuggestion {
  targetSection: string; // e.g., 'summary', 'experience', 'skills'
  targetId?: string; // id of the item to update (e.g., specific experience entry)
  originalText?: string;
  suggestedText: string;
  reasoning: string;
}

export async function POST(request: NextRequest) {
    console.log('[API] Chat request received');
    try {
        const body = await request.json();
        const { resumeId, message, profile, history, attachedContext } = body;

        console.log('[API] Request body:', { resumeId, messageLen: message?.length, hasProfile: !!profile });

        if (!message) {
            console.warn('[API] Missing message');
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // Save user message if resumeId exists and DB is connected
        if (resumeId && sql) {
             try {
                console.log('[API] Saving user message to DB...');
                await sql`
                    INSERT INTO resume_chat_messages (resume_id, role, content)
                    VALUES (${resumeId}, 'user', ${message})
                `;
                console.log('[API] User message saved.');
             } catch (dbError) {
                 console.error('[API] Failed to save user message:', dbError);
             }
        } else {
            console.log('[API] Skipping DB save (resumeId:', resumeId, ', sql:', !!sql, ')');
        }

        let aiResponseContent = "";
        let modelUsed = "none";
        let isFallback = false;
        let fallbackReason = "";

        if (!process.env.OPENAI_API_KEY) {
            // Mock response for development without API key
            console.log('Using Mock AI response (no OPENAI_API_KEY set)');
            modelUsed = "mock";
            isFallback = true;
            fallbackReason = "No OpenAI API key configured. Please add OPENAI_API_KEY to your .env file.";
            
            aiResponseContent = `⚠️ **AI Not Configured** - This is a simulated response.

To enable real AI analysis, please add your OpenAI API key to the .env file.

---

**Simulated Analysis:**

I've reviewed your resume for the ${profile?.targetJob || 'target'} role.

**Hiring Probability:** 45%

Here's what I notice:
1. Your summary needs to be more compelling - tell employers WHY they should hire you
2. Add quantifiable achievements to your experience (numbers, percentages, dollar amounts)
3. Ensure your skills align with your project descriptions

**To get real AI-powered feedback, configure your OpenAI API key.**`;
            
            // Simulate delay
            await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
                try {
                // Construct system prompt with resume context
                const safeHistory = Array.isArray(history) ? history : [];
                const model = "gpt-3.5-turbo";
                
                const systemPrompt = `You are "Myles", a smart, supportive "Study Buddy" and Career Peer. 
                Your goal is to help the user craft a great resume by acting like a knowledgeable friend who wants them to succeed.
                
                **Your Persona:**
                - **Tone:** Casual but professional, supportive, motivating, and straight to the point. Avoid stiff corporate speak.
                - **Role:** Like a TA or a senior student helping a junior. You know the rules but you explain them simply.
                - **Helper:** If a user is stuck, give examples. If something is bad, say it nicely but clearly: "This is a bit weak because..."
                - **Context-Aware:** ALWAYS analyze the entire resume context (below).
                - **Action-Oriented:** Propose concrete changes.
                
                **Resume Context:**
                - **Name:** ${profile?.contact?.firstName || ''} ${profile?.contact?.lastName || ''}
                - **Target Job:** ${profile?.targetJob || 'Not specified'} (Use this to tailor ALL feedback)
                - **Summary:** ${profile?.summary?.content || 'None'}
                - **Experience:** ${profile?.experience?.map((e: any) => `[ID: ${e.id}] ${e.position} at ${e.company} (${e.startDate || '?'} - ${e.endDate || 'Present'}): ${e.description} (Achievements: ${e.achievements?.join('; ')})`).join('\n') || 'None'}
                - **Education:** ${profile?.education?.map((e: any) => `${e.degree} from ${e.institution}`).join(', ') || 'None'}
                - **Skills:** ${profile?.skills ? Object.entries(profile.skills).map(([cat, skills]) => `${cat}: ${(skills as string[]).join(', ')}`).join('; ') : 'None'}
                
                **Response Format:**
                You must output your response in valid JSON format.
                Structure:
                {
                    "message": "Your conversational response here. Be helpful and direct.",
                    "suggestion": { // OPTIONAL: Include ONLY if you are proposing a specific text change
                        "targetSection": "summary" | "experience" | "education" | "skills",
                        "targetId": "id-of-item-if-experience-or-education",
                        "originalText": "The text you are replacing (if applicable)",
                        "suggestedText": "The new optimized text",
                        "reasoning": "Brief explanation of why this is better"
                    }
                }
                
                **Rules for Suggestions:**
                1. If the user asks to "rewrite" or "fix" something, YOU MUST provide a "suggestion" object.
                2. If the user just asks a question, omit the "suggestion" object.
                3. Ensure "suggestedText" is complete and ready to be inserted.
                `;

                // If there's attached context, add it to the system prompt
                let contextAddition = '';
                if (attachedContext) {
                    contextAddition = `
                    
                    **IMPORTANT - User is replying to a previous suggestion:**
                    - Section: ${attachedContext.targetSection}
                    - Original Text: "${attachedContext.originalText || 'N/A'}"
                    - Suggested Text: "${attachedContext.suggestedText}"
                    - Reasoning: "${attachedContext.reasoning || 'N/A'}"
                    
                    The user has questions or feedback about THIS specific suggestion. Address their concerns about this suggestion directly.
                    `;
                }

                const finalSystemPrompt = systemPrompt + contextAddition;

                const completion = await openai.chat.completions.create({
                    messages: [
                        { role: 'system', content: finalSystemPrompt },
                        ...safeHistory,
                        { role: "user", content: message }
                    ],
                    model,
                    response_format: { type: "json_object" }, // Force JSON output
                });

                const rawContent = completion.choices[0].message.content;
                let parsedContent;
                try {
                    parsedContent = JSON.parse(rawContent || "{}");
                } catch (e) {
                    // Fallback if AI fails JSON format
                    parsedContent = { message: rawContent || "I'm sorry, I couldn't process that request." };
                }

                aiResponseContent = parsedContent.message;
                const aiSuggestion = parsedContent.suggestion;
                modelUsed = model;
                isFallback = false;

                // Return structured response
                return NextResponse.json({ 
                    message: aiResponseContent,
                    suggestion: aiSuggestion,
                    metadata: {
                        model: modelUsed,
                        isFallback,
                    }
                });
            } catch (openaiError: any) {
                console.error('OpenAI API Error:', openaiError);
                
                // Fallback to mock response on error (e.g. quota exceeded)
                console.log('Falling back to Mock AI response due to API error');
                modelUsed = "mock";
                isFallback = true;
                
                // Determine specific error reason
                if (openaiError.status === 429) {
                    fallbackReason = "OpenAI API quota exceeded. Please check your billing at platform.openai.com";
                } else if (openaiError.status === 401) {
                    fallbackReason = "Invalid OpenAI API key. Please check your OPENAI_API_KEY in .env";
                } else {
                    fallbackReason = `OpenAI API error: ${openaiError.message || 'Unknown error'}`;
                }
                
                aiResponseContent = `⚠️ **AI Temporarily Unavailable** - Using fallback response

**Issue:** ${fallbackReason}

---

**Simulated Analysis:**

Based on your resume for the ${profile?.targetJob || 'target'} role:

**Estimated Hiring Probability:** 40%

**Quick Observations:**
1. Ensure your summary clearly states your unique value proposition
2. Add at least 3 quantifiable achievements to your most recent role
3. Verify your skills section aligns with the target job requirements

**Note:** This is a fallback response. Fix the API issue above to get real AI-powered analysis.`;
            }
        }

        // Save AI response if resumeId exists and DB is connected
        if (resumeId && sql) {
            try {
                await sql`
                    INSERT INTO resume_chat_messages (resume_id, role, content)
                    VALUES (${resumeId}, 'assistant', ${aiResponseContent})
                `;
            } catch (dbError) {
                console.error('Failed to save AI message:', dbError);
            }
        }

        return NextResponse.json({ 
            message: aiResponseContent,
            metadata: {
                model: modelUsed,
                isFallback,
                fallbackReason: isFallback ? fallbackReason : undefined
            }
        });

    } catch (error: any) {
        console.error('AI Chat Route Error:', error);
        // Return detailed error in dev, generic in prod
        return NextResponse.json({ 
            error: 'Internal Server Error', 
            details: error.message 
        }, { status: 500 });
    }
}
