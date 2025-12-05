import { ResumeProfile } from './resume-schema';

export interface ScoreCategory {
    label: string;
    score: number;
    maxScore: number;
    description: string;
    tips: string[];
    status: 'excellent' | 'good' | 'needs-work' | 'critical';
}

export interface ResumeScore {
    categories: ScoreCategory[];
    totalScore: number;
    maxTotalScore: number;
    percentage: number;
    atsCompatibility: number; // 0-100
    jobReadiness: number; // 0-100
    overallGrade: 'A' | 'B' | 'C' | 'D' | 'F';
    summary: string;
}

/**
 * Calculate comprehensive resume score with ATS focus
 * Treats all resumes as if applying for jobs - focuses on likelihood of passing ATS
 */
export function calculateResumeScore(profile: ResumeProfile): ResumeScore {
    const categories: ScoreCategory[] = [];

    // 1. ATS COMPATIBILITY (30 points) - Critical for getting past automated screening
    const atsScore = (() => {
        let score = 0;
        const tips: string[] = [];

        // Standard sections present (10 pts)
        const hasContact = profile.contact.firstName && profile.contact.lastName && profile.contact.email;
        const hasExperience = profile.experience.length > 0;
        const hasEducation = profile.education.length > 0;
        const hasSkills = Object.keys(profile.skills).length > 0;

        if (hasContact && hasExperience && hasEducation && hasSkills) {
            score += 10;
        } else {
            if (!hasContact) tips.push('Complete contact information (name, email, phone)');
            if (!hasExperience) tips.push('Add work experience section');
            if (!hasEducation) tips.push('Add education section');
            if (!hasSkills) tips.push('Add skills section');
        }

        // Keyword density in skills (10 pts)
        const totalSkills = Object.values(profile.skills).flat().length;
        if (totalSkills >= 10) score += 10;
        else if (totalSkills >= 5) {
            score += 5;
            tips.push(`Add more skills (${totalSkills}/10 recommended for ATS)`);
        } else {
            tips.push('Add at least 10 relevant skills for better ATS matching');
        }

        // Quantified achievements (10 pts)
        const hasNumbers = profile.experience.some(exp => 
            exp.achievements.some(ach => /\d+/.test(ach)) || /\d+/.test(exp.description)
        );
        if (hasNumbers) {
            score += 10;
        } else {
            tips.push('Add numbers/metrics to achievements (e.g., "increased sales by 30%")');
        }

        return {
            label: 'ATS Compatibility',
            score,
            maxScore: 30,
            description: 'How likely your resume will pass automated screening systems',
            tips,
            status: (score >= 25 ? 'excellent' : score >= 20 ? 'good' : score >= 10 ? 'needs-work' : 'critical') as any
        };
    })();
    categories.push(atsScore);

    // 2. CONTENT QUALITY (40 points) - Substance and relevance
    const contentScore = (() => {
        let score = 0;
        const tips: string[] = [];

        // Professional summary (10 pts)
        const summaryLength = profile.summary?.content?.length || 0;
        if (summaryLength >= 150) {
            score += 10;
        } else if (summaryLength >= 50) {
            score += 5;
            tips.push('Expand summary to 150+ characters for better impact');
        } else {
            tips.push('Add a compelling professional summary (150+ characters)');
        }

        // Experience depth (15 pts)
        const expWithDetails = profile.experience.filter(exp => 
            exp.description && exp.achievements.length >= 2
        ).length;
        
        if (expWithDetails >= 2) {
            score += 15;
        } else if (expWithDetails === 1) {
            score += 8;
            tips.push('Add detailed descriptions and achievements to all experiences');
        } else {
            tips.push('Each experience needs description + 2-3 achievements');
        }

        // Action verbs usage (10 pts)
        const actionVerbs = ['led', 'managed', 'developed', 'created', 'improved', 'increased', 'reduced', 'achieved', 'implemented', 'designed'];
        const hasActionVerbs = profile.experience.some(exp => 
            actionVerbs.some(verb => 
                exp.description?.toLowerCase().includes(verb) || 
                exp.achievements.some(ach => ach.toLowerCase().includes(verb))
            )
        );
        
        if (hasActionVerbs) {
            score += 10;
        } else {
            tips.push('Use strong action verbs (led, managed, developed, achieved, etc.)');
        }

        // Relevance indicators (5 pts)
        const hasRecentExp = profile.experience.some(exp => {
            const year = parseInt(exp.startDate?.split('-')[0] || '0');
            return year >= new Date().getFullYear() - 3;
        });
        
        if (hasRecentExp) {
            score += 5;
        } else {
            tips.push('Include recent experience (within last 3 years)');
        }

        return {
            label: 'Content Quality',
            score,
            maxScore: 40,
            description: 'Depth, relevance, and impact of your experience',
            tips,
            status: (score >= 35 ? 'excellent' : score >= 25 ? 'good' : score >= 15 ? 'needs-work' : 'critical') as any
        };
    })();
    categories.push(contentScore);

    // 3. COMPLETENESS (20 points) - All necessary sections filled
    const completenessScore = (() => {
        let score = 0;
        const tips: string[] = [];

        // Contact completeness (5 pts)
        const contactFields = [
            profile.contact.firstName,
            profile.contact.lastName,
            profile.contact.email,
            profile.contact.phone,
            profile.contact.location
        ].filter(Boolean).length;
        
        if (contactFields >= 5) score += 5;
        else if (contactFields >= 3) {
            score += 3;
            tips.push('Complete all contact fields (name, email, phone, location)');
        } else {
            tips.push('Add essential contact information');
        }

        // Education completeness (5 pts)
        const completeEducation = profile.education.filter(edu => 
            edu.institution && edu.degree && edu.fieldOfStudy
        ).length;
        
        if (completeEducation >= 1) {
            score += 5;
        } else if (profile.education.length > 0) {
            score += 2;
            tips.push('Complete education details (institution, degree, field of study)');
        } else {
            tips.push('Add education information');
        }

        // Skills categorization (5 pts)
        const skillCategories = Object.keys(profile.skills).length;
        if (skillCategories >= 2) {
            score += 5;
        } else if (skillCategories === 1) {
            score += 2;
            tips.push('Organize skills into categories (Technical, Soft Skills, etc.)');
        } else {
            tips.push('Add and categorize your skills');
        }

        // Professional links (5 pts)
        const hasLinks = profile.contact.linkedin || profile.contact.github || profile.contact.website;
        if (hasLinks) {
            score += 5;
        } else {
            tips.push('Add LinkedIn, GitHub, or portfolio link');
        }

        return {
            label: 'Completeness',
            score,
            maxScore: 20,
            description: 'All essential resume sections are filled out',
            tips,
            status: (score >= 18 ? 'excellent' : score >= 14 ? 'good' : score >= 8 ? 'needs-work' : 'critical') as any
        };
    })();
    categories.push(completenessScore);

    // 4. PROFESSIONAL POLISH (10 points) - Formatting and consistency
    const polishScore = (() => {
        let score = 0;
        const tips: string[] = [];

        // Consistent date formatting (3 pts)
        const hasDates = profile.experience.every(exp => exp.startDate);
        if (hasDates && profile.experience.length > 0) {
            score += 3;
        } else if (profile.experience.length > 0) {
            tips.push('Add dates to all experiences');
        }

        // No empty sections (3 pts)
        const hasEmptyAchievements = profile.experience.some(exp => 
            exp.achievements.length === 1 && !exp.achievements[0]
        );
        if (!hasEmptyAchievements) {
            score += 3;
        } else {
            tips.push('Remove or fill empty achievement bullets');
        }

        // Appropriate length (4 pts)
        const totalContent = profile.experience.length + profile.education.length + 
                            Object.values(profile.skills).flat().length;
        if (totalContent >= 10) {
            score += 4;
        } else if (totalContent >= 5) {
            score += 2;
            tips.push('Add more content for a complete resume');
        } else {
            tips.push('Resume needs more content (aim for 10+ items total)');
        }

        return {
            label: 'Professional Polish',
            score,
            maxScore: 10,
            description: 'Formatting, consistency, and presentation quality',
            tips,
            status: (score >= 9 ? 'excellent' : score >= 7 ? 'good' : score >= 4 ? 'needs-work' : 'critical') as any
        };
    })();
    categories.push(polishScore);

    // Calculate totals
    const totalScore = categories.reduce((sum, cat) => sum + cat.score, 0);
    const maxTotalScore = categories.reduce((sum, cat) => sum + cat.maxScore, 0);
    const percentage = Math.round((totalScore / maxTotalScore) * 100);

    // Calculate ATS compatibility (0-100)
    const atsCompatibility = Math.round((atsScore.score / atsScore.maxScore) * 100);

    // Calculate job readiness (weighted average of content + completeness)
    const jobReadiness = Math.round(
        ((contentScore.score / contentScore.maxScore) * 0.6 + 
         (completenessScore.score / completenessScore.maxScore) * 0.4) * 100
    );

    // Determine overall grade
    let overallGrade: 'A' | 'B' | 'C' | 'D' | 'F';
    if (percentage >= 90) overallGrade = 'A';
    else if (percentage >= 80) overallGrade = 'B';
    else if (percentage >= 70) overallGrade = 'C';
    else if (percentage >= 60) overallGrade = 'D';
    else overallGrade = 'F';

    // Generate summary
    let summary = '';
    if (percentage >= 85) {
        summary = 'Excellent! Your resume is highly competitive and ATS-optimized.';
    } else if (percentage >= 70) {
        summary = 'Good foundation. A few improvements will make your resume stand out.';
    } else if (percentage >= 50) {
        summary = 'Needs work. Focus on the critical areas below to improve your chances.';
    } else {
        summary = 'Critical improvements needed. Your resume may not pass ATS screening.';
    }

    return {
        categories,
        totalScore,
        maxTotalScore,
        percentage,
        atsCompatibility,
        jobReadiness,
        overallGrade,
        summary
    };
}
