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

Instructions:
1. Identify sentences or phrases that need improvement.
2. If a sentence has MULTIPLE issues (e.g., typos + weak verbs + wordiness), combine them into a **single suggestion** that rewrites the entire sentence.
3. If a sentence has only one small issue, just suggest the specific fix.
4. Focus on these improvements:
   - Typos and spelling errors
   - Grammar mistakes
   - Weak verbs → strong action verbs (e.g., "Responsible for" → "Led")
   - Passive voice → active voice
   - Vague statements → specific metrics (add numbers, %, $)
   - Wordiness → concise phrasing

For each suggestion, return:
{
  "type": "typo" | "grammar" | "wording" | "tone" | "metric",
  "severity": "error" | "warning" | "suggestion",
  "originalText": "exact text to replace (can be a full sentence)",
  "suggestedText": "replacement text (clean text, no markdown)",
  "reason": "why this is better",
  "impact": "what this improves",
  "startOffset": number (character position of originalText start),
  "endOffset": number (character position of originalText end)
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

  // 1. TYPOS & SPELLING ERRORS (Severity: Error)
  const typoPatterns = [
    { wrong: 'Responsable', correct: 'Responsible', reason: 'Spelling error' },
    { wrong: 'responsable', correct: 'responsible', reason: 'Spelling error' },
    { wrong: 'Recieved', correct: 'Received', reason: 'Common typo (i before e)' },
    { wrong: 'recieved', correct: 'received', reason: 'Common typo (i before e)' },
    { wrong: 'Experiance', correct: 'Experience', reason: 'Spelling error' },
    { wrong: 'experiance', correct: 'experience', reason: 'Spelling error' },
    { wrong: 'Managment', correct: 'Management', reason: 'Spelling error' },
    { wrong: 'managment', correct: 'management', reason: 'Spelling error' },
  ];

  typoPatterns.forEach(({ wrong, correct, reason }) => {
    const index = text.indexOf(wrong);
    if (index !== -1) {
      suggestions.push(
        createInlineSuggestion({
          type: 'typo',
          severity: 'error',
          targetSection: section as any,
          targetItemId: itemId,
          targetField: field,
          originalText: wrong,
          startOffset: index,
          endOffset: index + wrong.length,
          suggestedText: correct,
          reason,
          impact: 'Fixes spelling error for professional presentation',
        })
      );
    }
  });

  // 2. GRAMMAR MISTAKES (Severity: Error)
  const grammarPatterns = [
    { 
      wrong: /(\d+)\s+(developer|engineer|member|person)(?!\s*s)/gi,
      getMessage: (match: string, num: string, word: string) => ({
        original: match,
        suggested: `${num} ${word}s`,
        reason: 'Plural form needed after number'
      })
    },
  ];

  grammarPatterns.forEach(({ wrong, getMessage }) => {
    const matches = Array.from(text.matchAll(wrong));
    for (const match of matches) {
      if (match.index !== undefined) {
        const { original, suggested, reason } = getMessage(match[0], match[1], match[2]);
        suggestions.push(
          createInlineSuggestion({
            type: 'grammar',
            severity: 'error',
            targetSection: section as any,
            targetItemId: itemId,
            targetField: field,
            originalText: original,
            startOffset: match.index,
            endOffset: match.index + original.length,
            suggestedText: suggested,
            reason,
            impact: 'Corrects grammar for professional writing',
          })
        );
      }
    }
  });

  // 3. WEAK VERBS → STRONG ACTION VERBS (Severity: Warning)
  const weakVerbPatterns = [
    { weak: 'Responsible for managing', strong: 'Led', reason: 'Action verbs are stronger and more impactful' },
    { weak: 'Responsible for', strong: 'Led', reason: 'Action verbs show ownership and leadership' },
    { weak: 'Worked on developing', strong: 'Developed', reason: 'More direct and professional' },
    { weak: 'Worked on', strong: 'Developed', reason: 'Shows direct contribution' },
    { weak: 'Helped with', strong: 'Contributed to', reason: 'More professional and specific' },
    { weak: 'Was in charge of', strong: 'Directed', reason: 'Stronger leadership verb' },
    { weak: 'Did research on', strong: 'Researched', reason: 'Concise and active' },
    { weak: 'Assisted in', strong: 'Supported', reason: 'More professional tone' },
  ];

  weakVerbPatterns.forEach(({ weak, strong, reason }) => {
    const index = text.indexOf(weak);
    if (index !== -1) {
      suggestions.push(
        createInlineSuggestion({
          type: 'wording',
          severity: 'warning',
          targetSection: section as any,
          targetItemId: itemId,
          targetField: field,
          originalText: weak,
          startOffset: index,
          endOffset: index + weak.length,
          suggestedText: strong,
          reason,
          impact: 'Makes you sound more proactive and leadership-oriented',
        })
      );
    }
  });

  // 4. MISSING METRICS (Severity: Warning)
  // Check if text has no numbers and is long enough to warrant metrics
  if (!/\d+/.test(text) && text.length > 50 && field === 'description') {
    const firstSentenceEnd = text.indexOf('.') !== -1 ? text.indexOf('.') : Math.min(text.length, 100);
    const snippet = text.substring(0, firstSentenceEnd);
    
    suggestions.push(
      createInlineSuggestion({
        type: 'metric',
        severity: 'warning',
        targetSection: section as any,
        targetItemId: itemId,
        targetField: field,
        originalText: snippet,
        startOffset: 0,
        endOffset: firstSentenceEnd,
        suggestedText: snippet + ' [add specific metrics: %, $, or numbers]',
        reason: 'Quantifiable achievements are more compelling to recruiters',
        impact: 'Increases ATS score and makes impact measurable',
      })
    );
  }

  // 5. WORDINESS → CONCISE PHRASING (Severity: Suggestion)
  const wordyPatterns = [
    { wordy: 'In order to', concise: 'To', reason: 'Remove redundancy' },
    { wordy: 'in order to', concise: 'to', reason: 'Remove redundancy' },
    { wordy: 'Successfully completed', concise: 'Completed', reason: '"Successfully" is implied by completion' },
    { wordy: 'successfully completed', concise: 'completed', reason: '"Successfully" is implied' },
    { wordy: 'Utilized the use of', concise: 'Used', reason: 'Redundant phrasing' },
    { wordy: 'utilized the use of', concise: 'used', reason: 'Redundant phrasing' },
    { wordy: 'on a daily basis', concise: 'daily', reason: 'More concise' },
    { wordy: 'at this point in time', concise: 'currently', reason: 'Simpler and clearer' },
  ];

  wordyPatterns.forEach(({ wordy, concise, reason }) => {
    const index = text.indexOf(wordy);
    if (index !== -1) {
      suggestions.push(
        createInlineSuggestion({
          type: 'wording',
          severity: 'suggestion',
          targetSection: section as any,
          targetItemId: itemId,
          targetField: field,
          originalText: wordy,
          startOffset: index,
          endOffset: index + wordy.length,
          suggestedText: concise,
          reason,
          impact: 'Makes writing more concise and professional',
        })
      );
    }
  });

  // 6. PASSIVE VOICE → ACTIVE VOICE (Severity: Suggestion)
  const passivePatterns = [
    { 
      passive: /was responsible for (\w+ing)/gi,
      getActive: (match: string, verb: string) => verb.charAt(0).toUpperCase() + verb.slice(1),
      reason: 'Active voice shows direct ownership'
    },
    {
      passive: /meetings were organized/gi,
      getActive: () => 'Organized meetings',
      reason: 'Active voice is more direct'
    },
  ];

  passivePatterns.forEach(({ passive, getActive, reason }) => {
    const matches = Array.from(text.matchAll(passive));
    for (const match of matches) {
      if (match.index !== undefined) {
        const active = getActive(match[0], match[1]);
        suggestions.push(
          createInlineSuggestion({
            type: 'tone',
            severity: 'suggestion',
            targetSection: section as any,
            targetItemId: itemId,
            targetField: field,
            originalText: match[0],
            startOffset: match.index,
            endOffset: match.index + match[0].length,
            suggestedText: active,
            reason,
            impact: 'Shows ownership and initiative',
          })
        );
      }
    }
  });

  // 7. TONE & PROFESSIONALISM (Severity: Suggestion)
  const informalPatterns = [
    { informal: 'really good at', formal: 'excelled at', reason: 'More professional tone' },
    { informal: 'helped out with', formal: 'contributed to', reason: 'Professional phrasing' },
    { informal: 'got promoted to', formal: 'promoted to', reason: 'Remove informal "got"' },
  ];

  informalPatterns.forEach(({ informal, formal, reason }) => {
    const index = text.toLowerCase().indexOf(informal);
    if (index !== -1) {
      const originalText = text.substring(index, index + informal.length);
      suggestions.push(
        createInlineSuggestion({
          type: 'tone',
          severity: 'suggestion',
          targetSection: section as any,
          targetItemId: itemId,
          targetField: field,
          originalText,
          startOffset: index,
          endOffset: index + informal.length,
          suggestedText: formal,
          reason,
          impact: 'Improves professional tone',
        })
      );
    }
  });

  // 8. FORMATTING & CONSISTENCY (Severity: Suggestion)
  // Check for inconsistent capitalization in months
  const monthPattern = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\s*-\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{4}/gi;
  const monthMatches = Array.from(text.matchAll(monthPattern));
  
  for (const match of monthMatches) {
    if (match.index !== undefined) {
      const corrected = match[0].replace(
        /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/gi,
        (m: string) => m.charAt(0).toUpperCase() + m.slice(1).toLowerCase()
      );
      
      suggestions.push(
        createInlineSuggestion({
          type: 'formatting',
          severity: 'suggestion',
          targetSection: section as any,
          targetItemId: itemId,
          targetField: field,
          originalText: match[0],
          startOffset: match.index,
          endOffset: match.index + match[0].length,
          suggestedText: corrected,
          reason: 'Consistent capitalization for dates',
          impact: 'Improves formatting consistency',
        })
      );
    }
  }

  return suggestions;
}
