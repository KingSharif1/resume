import { ResumeProfile } from '@/lib/resume-schema';
import { jobAnalyzer } from './job-analyzer';

export interface ScoreBreakdown {
  completeness: number;
  impact: number;
  formatting: number;
  ats: number; // Only if JD provided
}

export interface ResumeScore {
  totalScore: number;
  breakdown: ScoreBreakdown;
  feedback: string[];
  missingKeywords?: string[];
}

export class ResumeScorer {
  private static instance: ResumeScorer;

  private constructor() {}

  public static getInstance(): ResumeScorer {
    if (!ResumeScorer.instance) {
      ResumeScorer.instance = new ResumeScorer();
    }
    return ResumeScorer.instance;
  }

  public async scoreResume(profile: ResumeProfile, jobDescription?: string): Promise<ResumeScore> {
    const completeness = this.calculateCompleteness(profile);
    const formatting = this.calculateFormatting(profile);
    const impact = this.calculateImpact(profile);
    
    let ats = 100; // Default to perfect if no JD
    let missingKeywords: string[] = [];

    if (jobDescription) {
      const analysis = await jobAnalyzer.analyzeJobDescription(jobDescription);
      const comparison = jobAnalyzer.compare(profile, analysis);
      ats = comparison.score;
      missingKeywords = comparison.missing;
    }

    // Weighted total
    // If JD exists: Completeness (20%), Formatting (20%), Impact (20%), ATS (40%)
    // If no JD: Completeness (30%), Formatting (30%), Impact (40%)
    
    let totalScore = 0;
    if (jobDescription) {
      totalScore = (completeness * 0.2) + (formatting * 0.2) + (impact * 0.2) + (ats * 0.4);
    } else {
      totalScore = (completeness * 0.3) + (formatting * 0.3) + (impact * 0.4);
    }

    return {
      totalScore: Math.round(totalScore),
      breakdown: {
        completeness: Math.round(completeness),
        formatting: Math.round(formatting),
        impact: Math.round(impact),
        ats: Math.round(ats)
      },
      feedback: this.generateFeedback(completeness, formatting, impact, ats, missingKeywords),
      missingKeywords
    };
  }

  private calculateCompleteness(profile: ResumeProfile): number {
    let score = 0;
    const checks = [
      { condition: !!(profile.contact.firstName && profile.contact.lastName), points: 10 },
      { condition: !!(profile.contact.email), points: 10 },
      { condition: !!(profile.contact.phone), points: 5 },
      { condition: !!(profile.summary?.content?.length && profile.summary.content.length > 50), points: 15 },
      { condition: (profile.experience.length > 0), points: 20 },
      { condition: (profile.education.length > 0), points: 15 },
      { condition: (Object.keys(profile.skills).length > 0), points: 15 },
      { condition: (profile.projects.length > 0), points: 10 }
    ];

    checks.forEach(check => {
      if (check.condition) score += check.points;
    });

    return Math.min(score, 100);
  }

  private calculateFormatting(profile: ResumeProfile): number {
    // Heuristics for good formatting
    let score = 100;
    
    // Check bullet point length (should be reasonable, not too short/long)
    let badBullets = 0;
    profile.experience.forEach(exp => {
      // Assuming description is markdown or plain text
      const bullets = exp.description.split('\n').filter(l => l.trim().length > 0);
      bullets.forEach(b => {
        if (b.length < 10 || b.length > 200) badBullets++;
      });
    });

    if (badBullets > 0) score -= (badBullets * 2);

    // Check for consistent capitalization (simple check)
    if (profile.contact.firstName && profile.contact.firstName[0] !== profile.contact.firstName[0].toUpperCase()) score -= 5;

    return Math.max(0, score);
  }

  private calculateImpact(profile: ResumeProfile): number {
    // Check for action verbs
    const actionVerbs = [
      'led', 'developed', 'created', 'managed', 'increased', 'decreased', 'optimized',
      'designed', 'implemented', 'achieved', 'generated', 'launched', 'improved'
    ];
    
    let actionVerbCount = 0;
    const text = JSON.stringify(profile.experience).toLowerCase();
    
    actionVerbs.forEach(verb => {
      if (text.includes(verb)) actionVerbCount++;
    });

    // Target: at least 5 unique action verbs for a good score
    return Math.min((actionVerbCount / 5) * 100, 100);
  }

  private generateFeedback(comp: number, fmt: number, imp: number, ats: number, missing: string[]): string[] {
    const feedback: string[] = [];

    if (comp < 80) feedback.push("Your resume is missing key sections. Add more details.");
    if (fmt < 80) feedback.push("Check your bullet point lengths. They should be concise but descriptive.");
    if (imp < 70) feedback.push("Use more strong action verbs (e.g., 'Led', 'Developed') to describe your experience.");
    if (ats < 70 && missing.length > 0) feedback.push(`You are missing key skills for this job: ${missing.slice(0, 3).join(', ')}`);

    if (feedback.length === 0) feedback.push("Great job! Your resume looks strong.");

    return feedback;
  }
}

export const resumeScorer = ResumeScorer.getInstance();
