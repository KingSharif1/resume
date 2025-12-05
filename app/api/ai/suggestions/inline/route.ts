import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { InlineSuggestion, createInlineSuggestion } from '@/lib/inline-suggestions';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'mock-key',
});

interface GenerateSuggestionsRequest {
  profile: any;
  section?: string;
  itemId?: string;
  field?: string;
  text?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateSuggestionsRequest = await request.json();
    const { profile, section, itemId, field, text } = body;

    if (!text && !profile) {
      return NextResponse.json({ error: 'Text or profile required' }, { status: 400 });
    }

    let suggestions: InlineSuggestion[] = [];

    if (!process.env.OPENAI_API_KEY) {
      // Mock suggestions for development
      suggestions = generateMockSuggestions(text || '', section, itemId, field);
    } else {
      try {
        suggestions = await generateAISuggestions(text || '', section, itemId, field, profile);
      } catch (error) {
        console.error('OpenAI API Error:', error);
        // Fallback to mock on error
        suggestions = generateMockSuggestions(text || '', section, itemId, field);
      }
    }

    return NextResponse.json({ suggestions });
  } catch (error: any) {
    console.error('Suggestion Generation Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}

async function generateAISuggestions(
  text: string,
  section?: string,
  itemId?: string,
  field?: string,
  profile?: any
): Promise<InlineSuggestion[]> {
  const prompt = `Analyze this resume text and suggest improvements. Return a JSON array of suggestions.

Text: "${text}"
Section: ${section || 'unknown'}
Field: ${field || 'unknown'}
Context: ${profile?.targetJob || 'General resume'}

Find and suggest improvements for:
1. Typos and spelling errors
2. Grammar mistakes
3. Weak verbs → strong action verbs (e.g., "Responsible for" → "Led", "Managed")
4. Passive voice → active voice
5. Vague statements → specific metrics (add numbers, %, $)
6. Wordiness → concise phrasing

For each suggestion, return:
{
  "type": "typo" | "grammar" | "wording" | "tone" | "metric",
  "severity": "error" | "warning" | "suggestion",
  "originalText": "exact text to replace",
  "suggestedText": "replacement text",
  "reason": "why this is better",
  "impact": "what this improves (optional)",
  "startOffset": number (character position),
  "endOffset": number
}

Return ONLY valid JSON array. No markdown, no explanation.`;

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'You are a resume writing expert. Analyze text and return JSON array of inline suggestions.',
      },
      { role: 'user', content: prompt },
    ],
    model: 'gpt-3.5-turbo',
    temperature: 0.3,
  });

  const content = completion.choices[0].message.content || '[]';
  
  try {
    const parsed = JSON.parse(content);
    return parsed.map((s: any) =>
      createInlineSuggestion({
        type: s.type,
        severity: s.severity,
        targetSection: section as any,
        targetItemId: itemId,
        targetField: field,
        originalText: s.originalText,
        startOffset: s.startOffset,
        endOffset: s.endOffset,
        suggestedText: s.suggestedText,
        reason: s.reason,
        impact: s.impact,
      })
    );
  } catch (e) {
    console.error('Failed to parse AI response:', content);
    return [];
  }
}

function generateMockSuggestions(
  text: string,
  section?: string,
  itemId?: string,
  field?: string
): InlineSuggestion[] {
  const suggestions: InlineSuggestion[] = [];

  // Mock: Find "Responsible for" and suggest "Led"
  const responsibleIndex = text.indexOf('Responsible for');
  if (responsibleIndex !== -1) {
    suggestions.push(
      createInlineSuggestion({
        type: 'wording',
        severity: 'warning',
        targetSection: section as any,
        targetItemId: itemId,
        targetField: field,
        originalText: 'Responsible for',
        startOffset: responsibleIndex,
        endOffset: responsibleIndex + 15,
        suggestedText: 'Led',
        reason: 'Action verbs are stronger and more impactful than passive phrases',
        impact: 'Makes you sound more proactive and leadership-oriented',
      })
    );
  }

  // Mock: Find "worked on" and suggest "developed"
  const workedIndex = text.toLowerCase().indexOf('worked on');
  if (workedIndex !== -1) {
    suggestions.push(
      createInlineSuggestion({
        type: 'wording',
        severity: 'suggestion',
        targetSection: section as any,
        targetItemId: itemId,
        targetField: field,
        originalText: text.substring(workedIndex, workedIndex + 9),
        startOffset: workedIndex,
        endOffset: workedIndex + 9,
        suggestedText: 'developed',
        reason: 'More specific and professional verb choice',
        impact: 'Shows technical ownership',
      })
    );
  }

  // Mock: Suggest adding metrics if no numbers found
  if (!/\d+/.test(text) && text.length > 50) {
    const firstSentenceEnd = text.indexOf('.') !== -1 ? text.indexOf('.') : text.length;
    suggestions.push(
      createInlineSuggestion({
        type: 'metric',
        severity: 'warning',
        targetSection: section as any,
        targetItemId: itemId,
        targetField: field,
        originalText: text.substring(0, firstSentenceEnd),
        startOffset: 0,
        endOffset: firstSentenceEnd,
        suggestedText: text.substring(0, firstSentenceEnd) + ' (add specific metrics here)',
        reason: 'Quantifiable achievements are more compelling to recruiters',
        impact: 'Increases ATS score by ~15% and makes impact measurable',
      })
    );
  }

  return suggestions;
}
