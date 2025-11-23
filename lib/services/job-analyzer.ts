import { ResumeProfile } from '@/lib/resume-schema';

export interface JobAnalysisResult {
  keywords: {
    hardSkills: string[];
    softSkills: string[];
    domainTerms: string[];
  };
  weightedKeywords: Array<{ word: string; score: number }>;
  missingKeywords: string[];
}

export class JobAnalyzer {
  private static instance: JobAnalyzer;

  private constructor() {}

  public static getInstance(): JobAnalyzer {
    if (!JobAnalyzer.instance) {
      JobAnalyzer.instance = new JobAnalyzer();
    }
    return JobAnalyzer.instance;
  }

  /**
   * Analyzes a job description to extract key requirements
   */
  public async analyzeJobDescription(description: string): Promise<JobAnalysisResult> {
    // In a real implementation, this would call an AI endpoint
    // For now, we'll use a sophisticated regex-based approach
    
    const hardSkills = this.extractHardSkills(description);
    const softSkills = this.extractSoftSkills(description);
    const domainTerms = this.extractDomainTerms(description);
    
    const allKeywords = [...hardSkills, ...softSkills, ...domainTerms];
    const weightedKeywords = this.calculateKeywordWeights(allKeywords, description);

    return {
      keywords: {
        hardSkills,
        softSkills,
        domainTerms
      },
      weightedKeywords,
      missingKeywords: [] // Calculated when comparing against a resume
    };
  }

  /**
   * Compares a resume against the analyzed job description
   */
  public compare(resume: ResumeProfile, jobAnalysis: JobAnalysisResult): { score: number; missing: string[] } {
    const resumeText = JSON.stringify(resume).toLowerCase();
    const missing: string[] = [];
    let matchCount = 0;
    let totalWeight = 0;

    for (const kw of jobAnalysis.weightedKeywords) {
      totalWeight += kw.score;
      if (resumeText.includes(kw.word.toLowerCase())) {
        matchCount += kw.score;
      } else {
        missing.push(kw.word);
      }
    }

    const score = totalWeight > 0 ? Math.round((matchCount / totalWeight) * 100) : 0;

    return {
      score,
      missing: missing.slice(0, 10) // Top 10 missing keywords
    };
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private createSkillRegex(skill: string): RegExp {
    const escaped = this.escapeRegExp(skill);
    const startBoundary = /^\w/.test(skill) ? '\\b' : '';
    const endBoundary = /\w$/.test(skill) ? '\\b' : '';
    return new RegExp(`${startBoundary}${escaped}${endBoundary}`, 'i');
  }

  private extractHardSkills(text: string): string[] {
    const commonTech = [
      'javascript', 'typescript', 'python', 'java', 'c++', 'react', 'angular', 'vue', 
      'node.js', 'aws', 'azure', 'docker', 'kubernetes', 'sql', 'nosql', 'git',
      'machine learning', 'ai', 'data analysis', 'project management'
    ];
    
    return commonTech.filter(skill => 
      this.createSkillRegex(skill).test(text)
    );
  }

  private extractSoftSkills(text: string): string[] {
    const commonSoft = [
      'leadership', 'communication', 'teamwork', 'problem solving', 'adaptability',
      'creativity', 'time management', 'critical thinking', 'collaboration'
    ];

    return commonSoft.filter(skill => 
      this.createSkillRegex(skill).test(text)
    );
  }

  private extractDomainTerms(text: string): string[] {
    // This would ideally use NLP to find noun phrases
    // For now, we'll look for capitalized words that appear frequently
    const words = text.match(/\b[A-Z][a-z]+\b/g) || [];
    const frequency: Record<string, number> = {};
    
    words.forEach(w => {
      if (w.length > 3) {
        frequency[w] = (frequency[w] || 0) + 1;
      }
    });

    return Object.entries(frequency)
      .filter(([_, count]) => count > 2)
      .map(([word]) => word);
  }

  private calculateKeywordWeights(keywords: string[], text: string): Array<{ word: string; score: number }> {
    return keywords.map(word => {
      // Count occurrences
      const regex = new RegExp(this.createSkillRegex(word).source, 'gi');
      const count = (text.match(regex) || []).length;
      
      // Base score is 1, add 0.5 for each extra occurrence, cap at 5
      const score = Math.min(1 + (count - 1) * 0.5, 5);
      
      return { word, score };
    }).sort((a, b) => b.score - a.score);
  }
}

export const jobAnalyzer = JobAnalyzer.getInstance();
