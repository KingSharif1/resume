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

export async function POST(request: NextRequest) {
    console.log('[API] Chat request received');
    try {
        const body = await request.json();
        const { resumeId, message, profile, history } = body;

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
                
                const systemPrompt = `You are a no-nonsense, high-stakes Career Counselor and Senior Recruiter. 
                Your ONLY goal is to get the user HIRED. You do not care about being nice; you care about results.
                
                Current Resume Context:
                - Name: ${profile?.contact?.firstName || ''} ${profile?.contact?.lastName || ''}
                - Target Job: ${profile?.targetJob || 'Not specified'}
                - Summary: ${profile?.summary?.content || 'None'}
                - Experience: ${profile?.experience?.map((e: any) => `${e.position} at ${e.company}`).join(', ') || 'None'}
                - Skills: ${profile?.skills ? Object.entries(profile.skills).map(([cat, skills]) => `${cat}: ${(skills as string[]).join(', ')}`).join('; ') : 'None'}
                - Active Suggestions: ${body.suggestions?.length || 0} inline text improvements pending
                - Resume Score: ${body.scoreData ? `${body.scoreData.totalScore}/${body.scoreData.maxTotalScore} (${body.scoreData.percentage}%)` : 'Not calculated'}
                - ATS Compatibility: ${body.scoreData?.atsCompatibility || 'Unknown'}%
                
                Your Guidelines:
                1. BE DIRECT AND CRITICAL. Do not sugarcoat your feedback. If a section is weak, say it is weak and explain why it won't get them hired.
                2. ESTIMATE HIRING PROBABILITY. In your first response, provide a brutally honest "Hiring Probability" score (0-100%) for their target job based strictly on this resume.
                3. FOCUS ON IMPACT. Demand metrics (%, $, time saved). If they are missing, tell them their resume looks "generic" and "ignorable".
                4. BE ACTION-ORIENTED. Tell them exactly what to rewrite. Give examples of strong bullet points.
                5. REFERENCE ACTIVE SUGGESTIONS. If there are pending suggestions, mention them and encourage the user to review them.
                6. USE SCORE DATA. Reference the ATS compatibility and overall score when giving feedback.
                
                Tone: Professional, authoritative, slightly strict, but ultimately helpful. Like a tough coach who wants them to win.`;

                const completion = await openai.chat.completions.create({
                    messages: [
                        { role: "system", content: systemPrompt },
                        ...safeHistory,
                        { role: "user", content: message }
                    ],
                    model,
                });

                aiResponseContent = completion.choices[0].message.content || "I'm sorry, I couldn't generate a response.";
                modelUsed = model;
                isFallback = false;
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
