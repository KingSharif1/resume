import { NextRequest, NextResponse } from 'next/server';

const XAI_API_KEY = process.env.XAI_API_KEY;
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const XAI_ENDPOINT = 'https://api.x.ai/v1/chat/completions';
const HUGGINGFACE_ENDPOINT = 'https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1';

interface AIChange {
  section: string;
  type: 'added' | 'modified' | 'removed';
  original?: string;
  modified: string;
  reason: string;
}

interface AISuggestion {
  section: string;
  type: 'keyword' | 'structure' | 'content';
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
}

interface TailoredResume {
  summary: string;
  sections: {
    title: string;
    content: string;
  }[];
  notes: string;
  changes?: AIChange[];
  suggestions?: AISuggestion[];
}

export async function POST(request: NextRequest) {
  try {
    const useHuggingFace = !XAI_API_KEY && HUGGINGFACE_API_KEY;

    if (!XAI_API_KEY && !HUGGINGFACE_API_KEY) {
      return NextResponse.json(
        { error: 'No AI API key configured. Please set either HUGGINGFACE_API_KEY or XAI_API_KEY' },
        { status: 500 }
      );
    }

    const { baseResume, jobDescription } = await request.json();

    if (!baseResume || !jobDescription) {
      return NextResponse.json(
        { error: 'Base resume and job description are required' },
        { status: 400 }
      );
    }

    const prompt = `You are an expert resume optimizer for ATS and recruiters. Tailor the base resume to match the job description.

RULES:
1. Preserve structure (sections: Experience, Skills, Education, etc.)
2. Incorporate 5-8 key keywords naturally
3. Concise bullets (1-2 lines)
4. Generate/add summary if missing
5. Track all changes made and explain why
6. Provide actionable suggestions for improvement

Output ONLY valid JSON with this structure:
{
  "summary": "professional summary",
  "sections": [{"title": "section name", "content": "markdown bullets"}],
  "notes": "brief overview",
  "changes": [
    {
      "section": "section name",
      "type": "added|modified|removed",
      "original": "original text (if modified/removed)",
      "modified": "new text",
      "reason": "why this change was made"
    }
  ],
  "suggestions": [
    {
      "section": "section name",
      "type": "keyword|structure|content",
      "suggestion": "specific actionable suggestion",
      "priority": "high|medium|low"
    }
  ]
}

Base Resume: ${baseResume}
Job Description: ${jobDescription}`;

    let aiResponse: string;

    if (useHuggingFace) {
      const response = await fetch(HUGGINGFACE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 2000,
            temperature: 0.7,
            return_full_text: false,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Hugging Face API error:', errorData);
        return NextResponse.json(
          { error: 'Failed to generate tailored resume' },
          { status: response.status }
        );
      }

      const data = await response.json();
      aiResponse = data[0]?.generated_text || data.generated_text || '';
    } else {
      const response = await fetch(XAI_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${XAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'grok-beta',
          messages: [
            {
              role: 'system',
              content: 'You are an expert resume optimizer. Always respond with valid JSON only.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('xAI API error:', errorData);
        return NextResponse.json(
          { error: 'Failed to generate tailored resume' },
          { status: response.status }
        );
      }

      const data = await response.json();
      aiResponse = data.choices?.[0]?.message?.content || '';
    }

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    let tailoredResume: TailoredResume;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        tailoredResume = JSON.parse(jsonMatch[0]);
      } else {
        tailoredResume = JSON.parse(aiResponse);
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json(
        { error: 'Invalid response format from AI' },
        { status: 500 }
      );
    }

    if (!tailoredResume.summary || !tailoredResume.sections) {
      return NextResponse.json(
        { error: 'Incomplete resume data from AI' },
        { status: 500 }
      );
    }

    if (!tailoredResume.changes) {
      tailoredResume.changes = [];
    }
    if (!tailoredResume.suggestions) {
      tailoredResume.suggestions = [];
    }

    return NextResponse.json({ tailoredResume });
  } catch (error) {
    console.error('Resume tailoring error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
