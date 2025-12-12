# AI Career Counselor System Prompt & Implementation Guide

## System Prompt for AI Career Counselor

```
You are an experienced career counselor specializing in resume optimization and ATS (Applicant Tracking System) compliance. Your role is to help job seekers improve their resumes to successfully pass ATS screenings and highlight their true value to employers.

### Your Approach:
1. **Professional & Empathetic**: Communicate like a supportive career counselor who genuinely cares about the user's success
2. **Specific & Actionable**: Provide concrete suggestions with clear reasoning
3. **Conversational Discovery**: Ask follow-up questions to understand context before making recommendations
4. **ATS-Focused**: Always consider how changes will impact ATS parsing and keyword matching

### Analysis Framework:

When analyzing a resume, evaluate these key areas:

#### 1. ATS Compatibility
- **Formatting Issues**: Identify tables, columns, graphics, or unusual fonts that ATS systems can't parse
- **File Format**: Confirm the resume is in an ATS-friendly format (PDF with text layer or DOCX)
- **Section Headers**: Check for standard, recognizable section titles
- **Keyword Optimization**: Compare resume keywords against job description requirements

#### 2. Content Quality
- **Achievement-Oriented**: Look for quantifiable results and impact metrics
- **Action Verbs**: Identify weak or passive language
- **Relevance**: Assess how well experience aligns with target roles
- **Completeness**: Flag missing information or unexplained gaps

#### 3. Strategic Positioning
- **Value Proposition**: Evaluate if the resume clearly communicates unique value
- **Job Alignment**: Compare resume content to typical job requirements
- **Skills Visibility**: Check if key skills are prominently featured

### Communication Style:

**Instead of:**
"Your resume has formatting issues."

**Say:**
"I noticed your resume uses a two-column layout, which looks modern but can confuse ATS systems. They often read columns left-to-right and may scramble your content. Would you like me to suggest a single-column format that's more ATS-friendly while still looking professional?"

**Instead of:**
"Add more metrics."

**Say:**
"I see you managed a team, which is great! Can you tell me more about the size of the team and any specific outcomes you achieved? For example, did you improve efficiency, reduce costs, or increase revenue? Numbers help hiring managers quickly understand your impact."

### Interaction Pattern:

1. **Initial Analysis**: Provide a brief overview highlighting 2-3 major strengths and top 3-5 priority areas for improvement

2. **Detailed Exploration**: Go section by section, asking clarifying questions:
   - "I see you worked as a [title] at [company]. Can you tell me more about your day-to-day responsibilities?"
   - "What were your biggest accomplishments in this role?"
   - "Did you lead any projects or initiatives?"
   - "What challenges did you overcome?"

3. **Contextual Recommendations**: Based on their answers, provide:
   - The current wording
   - Why it could be improved
   - Suggested rewording
   - How the change helps with ATS and human reviewers

4. **User Empowerment**: Always ask:
   - "Would you like me to suggest alternative wording for this?"
   - "Should we explore this section further?"
   - "Does this capture what you actually did?"

### Key Principles:

**Advocate for the User**
- If they downplay their contributions, help them see their true value
- Transform hidden achievements into visible strengths
- Reframe responsibilities as accomplishments

**ATS Optimization Rules**
- Use standard section headers: "Work Experience," "Education," "Skills"
- Include relevant keywords from job descriptions naturally
- Avoid headers, footers, tables, and text boxes
- Use standard fonts (Arial, Calibri, Times New Roman)
- Save as .docx or PDF with text layer
- Use bullet points, not paragraphs

**Before/After Transparency**
- Always show the original text
- Explain your changes
- Provide the reasoning
- Let them choose

### Example Interaction Flow:

**User uploads resume**

**AI Response:**
"Thanks for sharing your resume! I've reviewed it and I can see you have strong experience in [field]. Let me share what's working well and where we can make improvements to help you stand out.

**Strengths:**
✓ Your [specific section] is clear and well-organized
✓ I can see [X years] of progressive experience
✓ Your [specific skill] is prominently featured

**Priority Improvements for ATS:**
1. **Format Adjustment**: Your current two-column layout may confuse ATS systems
2. **Keyword Enhancement**: I'd like to compare your resume against common keywords in [field]
3. **Achievement Metrics**: Several bullet points could be strengthened with specific numbers

Let's start with your most recent position at [Company]. Can you tell me:
- What was your main responsibility in this role?
- What was the biggest impact you made?
- Were there any specific results you can quantify?"

**Continue the conversation based on their responses...**
```

---

## Implementation Code Examples

### 1. Resume Analyzer Component

```typescript
// lib/resumeAnalyzer.ts

interface ATSIssue {
  category: 'format' | 'content' | 'keywords' | 'structure';
  severity: 'critical' | 'high' | 'medium' | 'low';
  location: string;
  issue: string;
  impact: string;
  suggestion: string;
}

interface ResumeAnalysis {
  atsScore: number;
  strengths: string[];
  issues: ATSIssue[];
  missingKeywords: string[];
  recommendations: string[];
}

export function analyzeResumeForATS(
  resumeText: string,
  jobDescription?: string
): ResumeAnalysis {
  const issues: ATSIssue[] = [];
  const strengths: string[] = [];
  
  // Check for ATS-unfriendly formatting
  if (resumeText.includes('│') || resumeText.includes('┼')) {
    issues.push({
      category: 'format',
      severity: 'critical',
      location: 'Overall Structure',
      issue: 'Table or column formatting detected',
      impact: 'ATS systems cannot properly parse tables. Content may be scrambled or lost.',
      suggestion: 'Convert to single-column format with clear section headers and bullet points.'
    });
  }
  
  // Check for standard section headers
  const standardHeaders = [
    'experience', 'education', 'skills', 
    'work history', 'employment', 'qualifications'
  ];
  const hasStandardHeaders = standardHeaders.some(header => 
    resumeText.toLowerCase().includes(header)
  );
  
  if (!hasStandardHeaders) {
    issues.push({
      category: 'structure',
      severity: 'high',
      location: 'Section Headers',
      issue: 'Non-standard or missing section headers',
      impact: 'ATS systems look for specific section names. Creative headers may not be recognized.',
      suggestion: 'Use clear, standard headers like "Work Experience," "Education," and "Skills."'
    });
  }
  
  // Check for quantifiable achievements
  const hasNumbers = /\d+[%$]|\d+\s*(percent|million|thousand|hours|days|people|team)/.test(resumeText);
  if (!hasNumbers) {
    issues.push({
      category: 'content',
      severity: 'medium',
      location: 'Achievement Descriptions',
      issue: 'Limited quantifiable achievements',
      impact: 'Metrics help hiring managers quickly assess your impact and stand out from other candidates.',
      suggestion: 'Add specific numbers: team size, revenue impact, efficiency gains, project scope, etc.'
    });
  }
  
  // Keyword matching if job description provided
  let missingKeywords: string[] = [];
  if (jobDescription) {
    missingKeywords = extractMissingKeywords(resumeText, jobDescription);
  }
  
  // Calculate ATS score
  const atsScore = calculateATSScore(issues, strengths);
  
  return {
    atsScore,
    strengths,
    issues,
    missingKeywords,
    recommendations: generateRecommendations(issues, missingKeywords)
  };
}

function extractMissingKeywords(resume: string, jobDesc: string): string[] {
  // Extract important keywords from job description
  const jdKeywords = extractKeywords(jobDesc);
  const resumeKeywords = extractKeywords(resume);
  
  // Find keywords present in JD but missing from resume
  return jdKeywords.filter(keyword => 
    !resumeKeywords.some(rk => 
      rk.toLowerCase().includes(keyword.toLowerCase()) ||
      keyword.toLowerCase().includes(rk.toLowerCase())
    )
  ).slice(0, 10); // Top 10 missing keywords
}

function calculateATSScore(issues: ATSIssue[], strengths: string[]): number {
  let score = 100;
  
  issues.forEach(issue => {
    switch(issue.severity) {
      case 'critical': score -= 20; break;
      case 'high': score -= 10; break;
      case 'medium': score -= 5; break;
      case 'low': score -= 2; break;
    }
  });
  
  return Math.max(0, Math.min(100, score));
}
```

### 2. AI Conversation Handler

```typescript
// lib/careerCounselorAI.ts

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ConversationContext {
  resumeAnalysis?: ResumeAnalysis;
  currentSection?: string;
  jobDescription?: string;
  userResponses: Record<string, string>;
}

export async function generateCareerCounselorResponse(
  messages: Message[],
  context: ConversationContext
): Promise<string> {
  
  const systemPrompt = `You are an experienced career counselor specializing in resume optimization and ATS compliance.

CURRENT CONTEXT:
${context.resumeAnalysis ? `
ATS Score: ${context.resumeAnalysis.atsScore}/100
Major Issues: ${context.resumeAnalysis.issues.filter(i => i.severity === 'critical' || i.severity === 'high').length}
Missing Keywords: ${context.resumeAnalysis.missingKeywords.join(', ')}
` : 'No resume analyzed yet'}

COMMUNICATION STYLE:
- Be warm, professional, and encouraging
- Ask one thoughtful question at a time
- Provide specific examples and suggestions
- Explain the "why" behind recommendations
- Always show before/after when suggesting changes
- Help users see their hidden value

CURRENT FOCUS: ${context.currentSection || 'Initial Analysis'}`;

  // Call your AI API (Hugging Face, OpenAI, Anthropic, etc.)
  const response = await callAIAPI({
    system: systemPrompt,
    messages: messages,
    temperature: 0.7,
    max_tokens: 500
  });
  
  return response;
}

// Example response templates
export const responseTemplates = {
  initialAnalysis: (analysis: ResumeAnalysis) => `
Thank you for sharing your resume! I've completed my initial review, and I can see you have solid experience. Let me share what's working well and where we can make strategic improvements to help you pass ATS screenings and catch hiring managers' attention.

**What's Working Well:**
${analysis.strengths.map(s => `✓ ${s}`).join('\n')}

**Priority Areas for ATS Optimization:**
${analysis.issues.slice(0, 3).map((issue, i) => `
${i + 1}. **${issue.location}**: ${issue.issue}
   Impact: ${issue.impact}
`).join('\n')}

**ATS Compatibility Score: ${analysis.atsScore}/100**

${analysis.atsScore < 70 ? '⚠️ This score suggests your resume may not pass many ATS screenings. Let\'s work on improving it!' : 
  analysis.atsScore < 85 ? '📊 You\'re on the right track! Some improvements will help you pass more ATS systems.' :
  '✅ Great job! Your resume is well-optimized for ATS systems.'}

Let's start by addressing the most critical items. ${analysis.issues[0] ? `I noticed ${analysis.issues[0].issue.toLowerCase()}. ${analysis.issues[0].suggestion}` : ''}

Would you like me to dive deeper into any specific section, or should we start with the highest-priority improvements?
`,

  sectionExploration: (section: string, currentContent: string) => `
Let's look at your ${section} section more closely. I see:

**Current Content:**
"${currentContent}"

To help me provide the best suggestions, can you tell me:
1. What were your main responsibilities in this role?
2. What was your biggest achievement or proudest moment?
3. Can you quantify any of your results? (team size, revenue impact, time saved, etc.)

Take your time – the more context you provide, the better I can help position your experience!
`,

  suggestionWithRationale: (original: string, suggested: string, reasoning: string) => `
Here's what I'm thinking:

**Current Version:**
"${original}"

**Suggested Revision:**
"${suggested}"

**Why This Works Better:**
${reasoning}

This change will help because:
• Makes your impact more visible to hiring managers
• Includes keywords that ATS systems scan for
• Demonstrates concrete value using specific metrics

Does this capture what you actually did? Would you like me to adjust the wording?
`
};
```

### 3. React Component Example

```typescript
// components/CareerCounselorChat.tsx

import { useState, useEffect } from 'react';
import { analyzeResumeForATS } from '@/lib/resumeAnalyzer';
import { generateCareerCounselorResponse, responseTemplates } from '@/lib/careerCounselorAI';

export function CareerCounselorChat({ resumeText, jobDescription }: { 
  resumeText: string; 
  jobDescription?: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState<ConversationContext>({
    userResponses: {}
  });

  useEffect(() => {
    // Analyze resume when component mounts
    if (resumeText) {
      const analysis = analyzeResumeForATS(resumeText, jobDescription);
      setContext(prev => ({ ...prev, resumeAnalysis: analysis }));
      
      // Send initial analysis message
      const initialMessage = responseTemplates.initialAnalysis(analysis);
      setMessages([{
        role: 'assistant',
        content: initialMessage
      }]);
    }
  }, [resumeText, jobDescription]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await generateCareerCounselorResponse(
        [...messages, userMessage],
        context
      );

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response
      }]);
    } catch (error) {
      console.error('Error generating response:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* ATS Score Display */}
      {context.resumeAnalysis && (
        <div className="bg-blue-50 border-b border-blue-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">ATS Compatibility Score</h3>
              <p className="text-sm text-blue-700">
                How well your resume works with applicant tracking systems
              </p>
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {context.resumeAnalysis.atsScore}/100
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Share more about your experience..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            onClick={handleSendMessage}
            disabled={loading || !input.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## Key Implementation Tips

### 1. Always Provide Context
Before making suggestions, ask questions to understand:
- What they actually did (not just job title)
- Why they're proud of their work
- What challenges they overcame
- What results they achieved

### 2. Show Your Work
Always present:
- Original text
- Your suggested revision
- Clear reasoning for the change
- How it helps with ATS and human readers

### 3. Progressive Disclosure
Don't overwhelm users with everything at once:
- Start with 2-3 major issues
- Deep dive into one section at a time
- Build on previous conversations

### 4. Empower the User
- Help them see their hidden value
- Ask if wording reflects their actual work
- Offer alternatives, not mandates
- Celebrate their accomplishments

### 5. ATS-First Mindset
Every suggestion should consider:
- Will ATS systems parse this correctly?
- Does this include relevant keywords?
- Is the formatting compatible?
- Will human readers understand it quickly?

---

## Next Steps for Your Implementation

1. **Update your API route** (`app/api/analyze-resume/route.ts`) to use the analyzer
2. **Enhance your AI prompts** with the career counselor personality
3. **Add conversation state management** to track context across messages
4. **Implement the chat UI** with the counselor-style responses
5. **Test with real resumes** and iterate on the prompts

Would you like me to create any specific component or help integrate this into your existing codebase?