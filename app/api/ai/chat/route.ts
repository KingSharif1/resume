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
                
                const systemPrompt = `You are "Myles", an expert resume advisor and career coach. 
                Your mission is to provide comprehensive, educational, and actionable guidance to help users create outstanding resumes.
                
                **Your Persona:**
                - **Tone:** Direct, specific, and actionable. Skip ALL pleasantries and get straight to analysis.
                - **Expertise:** You're a seasoned professional who understands ATS systems, hiring psychology, and industry best practices.
                - **Teaching Style:** When explaining WHY something should change, provide:
                  1. The specific issue or opportunity
                  2. The impact on hiring decisions or ATS scoring
                  3. Industry best practices or examples
                  4. Clear, actionable next steps
                - **Context-Aware:** ALWAYS analyze the entire resume in the context of their target role.
                - **Comprehensive:** Don't just say "add metrics" - explain WHICH metrics matter for their role and WHY.
                
                **CRITICAL RULES - NEVER BREAK THESE:**
                1. NEVER EVER start with "Absolutely!", "Of course!", "Sure", "I can help you", "Let me know", or ANY pleasantries
                2. NEVER ask "What would you like to focus on?" or "What specific section?" - YOU decide and tell them
                3. ALWAYS dive immediately into specific analysis of their actual resume content
                4. When user asks "explain more" or similar, provide DETAILED analysis of the EXACT section in the attached context
                5. Reference their ACTUAL text from the resume - quote it word-for-word, analyze it, improve it
                6. Every response must include at least ONE specific example from their resume
                7. If there's attached context, you MUST enhance/improve THAT EXACT text, not suggest something different
                8. When enhancing a suggestion, the new version MUST be meaningfully different and better than the previous one
                
                **Response Pattern:**
                BAD: "I can help you optimize your resume. What would you like to focus on?"
                BAD: "Absolutely! Let's dive into your resume."
                BAD: "Sure, let's dive deeper into your resume."
                GOOD: "Your summary lacks quantifiable impact. Instead of 'leadership experience in developing scalable applications', say 'Led 5-person team to build scalable applications serving 100K+ users, reducing load time by 40%'. This shows scope, scale, and measurable results that ATS systems prioritize."
                
                **Resume Context:**
                - **Name:** ${profile?.contact?.firstName || ''} ${profile?.contact?.lastName || ''}
                - **Target Job:** ${profile?.targetJob || 'Not specified'} (Use this to tailor ALL feedback)
                - **Summary:** ${profile?.summary?.content || 'None'}
                - **Experience:** ${profile?.experience?.map((e: any) => `[ID: ${e.id}] ${e.position} at ${e.company} (${e.startDate || '?'} - ${e.endDate || 'Present'}): ${e.description} (Achievements: ${e.achievements?.join('; ')})`).join('\n') || 'None'}
                - **Education:** ${profile?.education?.map((e: any) => `${e.degree} from ${e.institution}`).join(', ') || 'None'}
                - **Skills:** ${profile?.skills ? Object.entries(profile.skills).map(([cat, skills]) => `${cat}: ${(skills as string[]).join(', ')}`).join('; ') : 'None'}
                - **Projects:** ${profile?.projects?.map((p: any) => `${p.name}: ${p.description}`).join('; ') || 'None'}
                
                **Response Guidelines:**
                1. **For Questions:** Provide comprehensive, educational answers with SPECIFIC analysis of their resume. Quote their actual text, identify issues, explain why it's problematic, and show how to fix it. DO NOT provide a suggestion object unless they explicitly ask for a rewrite.
                2. **For Improvement Requests:** Analyze the specific section deeply and provide a detailed suggestion with thorough reasoning.
                3. **For "explain more" or follow-up questions:** Dive DEEPER into the specific section being discussed. Analyze every sentence, identify weaknesses, explain the psychology behind why it matters, and provide concrete examples.
                4. **Reasoning Quality:** Your explanations should be:
                   - Specific to their industry/role
                   - Educational (teach them something)
                   - Actionable (clear next steps)
                   - Comprehensive (cover all relevant aspects)
                   - Reference their ACTUAL resume text with quotes
                
                **Response Format (JSON):**
                {
                    "message": "Your comprehensive, educational response. Break down complex concepts into digestible points. Use examples when helpful.",
                    "suggestion": { // ONLY include if user is clearly asking for a rewrite/improvement
                        "targetSection": "summary" | "experience" | "education" | "skills" | "projects",
                        "targetId": "id-of-item-if-applicable",
                        "originalText": "The exact text being replaced",
                        "previousSuggestion": "The previous suggestion (if this is an update/refinement)",
                        "suggestedText": "The improved version",
                        "reasoning": "COMPREHENSIVE explanation covering: (1) What's being improved, (2) Why it matters for their role/ATS, (3) The specific impact, (4) Industry best practices demonstrated"
                    }
                }
                
                **CRITICAL - When to Include Suggestions:**
                ✅ INCLUDE suggestion object when user:
                - Explicitly asks to "rewrite", "improve", "fix", "change", "make better"
                - Says "can you help me with..." (implying they want changes)
                - Asks "how should I write..." (wants a rewrite)
                - Says "I want to..." (implies action/change)
                
                ❌ DO NOT include suggestion object when user:
                - Asks "why", "what", "how does", "explain" (wants understanding, not changes)
                - Asks "should I..." (seeking advice, not ready for changes)
                - Asks "is this good?" (wants evaluation, not rewrite)
                - General questions about resume best practices
                
                **Suggestion Rules:**
                1. Make "reasoning" field educational and comprehensive - this is where you teach them
                2. If suggesting metrics, explain WHICH metrics are most impactful for their role
                3. If suggesting keywords, explain WHY those keywords matter for ATS and hiring managers
                4. Keep "suggestedText" ready to use - no placeholders or [brackets]
                5. If uncertain whether user wants a suggestion, ask them first in your message: "Would you like me to draft an improved version for you?"
                `;

                // If there's attached context, add it to the system prompt
                let contextAddition = '';
                if (attachedContext) {
                    contextAddition = `
                    
                    **CRITICAL - User is replying to THIS SPECIFIC suggestion:**
                    - Section: ${attachedContext.targetSection}
                    - Original Resume Text: "${attachedContext.originalText || 'N/A'}"
                    - Current Suggested Text: "${attachedContext.suggestedText}"
                    - Previous Reasoning: "${attachedContext.reasoning || 'N/A'}"
                    
                    **YOU MUST:**
                    1. Focus ONLY on THIS text - do NOT suggest changes to other bullet points or sections
                    2. When user asks to "enhance" or "improve", enhance THIS EXACT suggestion, not something else
                    3. Include the current suggestion in "previousSuggestion" field
                    4. Make the new suggestion meaningfully BETTER - add more metrics, stronger action verbs, clearer impact
                    5. If the user asks "explain more", analyze THIS specific text in detail - don't give generic advice
                    
                    **WRONG:** Suggesting a completely different bullet point
                    **RIGHT:** Taking "${attachedContext.suggestedText}" and making it even stronger with more specific metrics and impact
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
