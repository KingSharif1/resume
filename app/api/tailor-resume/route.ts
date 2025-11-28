import { NextRequest, NextResponse } from 'next/server';
import { HfInference } from '@huggingface/inference';

const HF_MODEL = "mistralai/Mistral-7B-Instruct-v0.3";

export async function POST(request: NextRequest) {
  try {
    const { resumeText, jobDescription } = await request.json();

    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { error: 'Missing resume text or job description' },
        { status: 400 }
      );
    }

    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'HuggingFace API key not configured' },
        { status: 500 }
      );
    }

    const hf = new HfInference(apiKey);

    const prompt = `<s>[INST] You are an expert career coach and resume writer. 
    
Task: Tailor the following resume to better match the provided job description.
Focus on:
1. Highlighting relevant skills and experience.
2. Adjusting the professional summary to align with the job goals.
3. Using keywords from the job description where appropriate.

Return the result as a JSON object with the following structure:
{
  "summary": "Updated professional summary...",
  "skills": {
    "technical": ["added skill 1", "existing skill"],
    "soft": ["added soft skill"]
  },
  "improvements": ["List of specific changes made..."]
}

Resume:
${resumeText.substring(0, 3000)}

Job Description:
${jobDescription.substring(0, 1500)}
[/INST]`;

    const response = await hf.textGeneration({
      model: HF_MODEL,
      inputs: prompt,
      parameters: {
        max_new_tokens: 1024,
        temperature: 0.2,
        return_full_text: false
      }
    });

    let generatedText = response.generated_text.trim();
    generatedText = generatedText.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');

    try {
      const tailoredData = JSON.parse(generatedText);
      return NextResponse.json({ success: true, data: tailoredData });
    } catch (e) {
      console.error('Failed to parse tailored resume JSON', e);
      return NextResponse.json(
        { error: 'Failed to generate valid JSON response from AI' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Tailoring error:', error);
    return NextResponse.json(
      { error: 'Internal server error during tailoring' },
      { status: 500 }
    );
  }
}
