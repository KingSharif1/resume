import { NextRequest, NextResponse } from 'next/server';

const XAI_API_KEY = process.env.XAI_API_KEY;
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const XAI_ENDPOINT = 'https://api.x.ai/v1/chat/completions';
const HUGGINGFACE_ENDPOINT = 'https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1';

export async function POST(request: NextRequest) {
  try {
    const useHuggingFace = !XAI_API_KEY && HUGGINGFACE_API_KEY;

    if (!XAI_API_KEY && !HUGGINGFACE_API_KEY) {
      return NextResponse.json(
        { error: 'No AI API key configured' },
        { status: 500 }
      );
    }

    const { message, resumeContent, conversationHistory } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert resume consultant and career advisor. You help people improve their resumes by:
- Suggesting better wording and stronger action verbs
- Identifying missing keywords for ATS optimization
- Recommending structural improvements
- Providing specific, actionable feedback
- Helping quantify achievements
- Ensuring consistency and professionalism

The user's current resume content:
${resumeContent}

Provide helpful, specific, and actionable advice. Keep responses concise but thorough.`;

    let aiResponse: string;

    if (useHuggingFace) {
      const conversationText = conversationHistory
        .map((msg: any) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');

      const fullPrompt = `${systemPrompt}\n\n${conversationText}\nUser: ${message}\nAssistant:`;

      const response = await fetch(HUGGINGFACE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: fullPrompt,
          parameters: {
            max_new_tokens: 500,
            temperature: 0.7,
            return_full_text: false,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Hugging Face API error');
      }

      const data = await response.json();
      aiResponse = data[0]?.generated_text || data.generated_text || 'I apologize, but I encountered an error. Please try again.';
    } else {
      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-6).map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        })),
        { role: 'user', content: message },
      ];

      const response = await fetch(XAI_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${XAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'grok-beta',
          messages,
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error('xAI API error');
      }

      const data = await response.json();
      aiResponse = data.choices?.[0]?.message?.content || 'I apologize, but I encountered an error. Please try again.';
    }

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error('Resume chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
