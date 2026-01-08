import { ResumeProfile } from './resume-schema';

export interface ActionableTip {
    message: string;
    section?: string; // e.g., 'contact', 'experience', 'summary'
    field?: string; // e.g., 'firstName', 'company', 'description'
    itemId?: string; // For array items like experience[0].id
    originalText?: string;
    suggestedText?: string;
    canAutoFix?: boolean; // Whether this tip can be auto-applied
}

export interface ScoreCategory {
    label: string;
    score: number;
    maxScore: number;
    description: string;
    tips: string[]; // Keep for backward compatibility
    actionableTips?: ActionableTip[]; // New enhanced tips with metadata
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
    console.log('📊 [ResumeScore] Calculating score...', {
        timestamp: new Date().toISOString(),
        hasContact: !!(profile.contact.firstName && profile.contact.lastName),
        experienceCount: profile.experience.length,
        educationCount: profile.education.length,
        skillCategories: Object.keys(profile.skills).length
    });
    
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

        console.log('  ✅ ATS Compatibility:', score, '/30', tips.length > 0 ? `(${tips.length} tips)` : '');
        
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

        console.log('  ✅ Content Quality:', score, '/40', tips.length > 0 ? `(${tips.length} tips)` : '');
        
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

        console.log('  ✅ Completeness:', score, '/20', tips.length > 0 ? `(${tips.length} tips)` : '');
        
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
        let score = 10; // Start with full points and deduct for issues
        const tips: string[] = [];
        const actionableTips: ActionableTip[] = [];
        
        // Calculate content metrics for sensitivity
        const wordCount = profile.experience.reduce((sum, exp) => {
            const words = (exp.description + ' ' + exp.achievements.join(' ')).split(/\s+/).filter(w => w.length > 0);
            return sum + words.length;
        }, 0);

        // Consistent date formatting (deduct 2 pts if missing)
        const hasDates = profile.experience.every(exp => exp.startDate);
        if (!hasDates && profile.experience.length > 0) {
            score -= 2;
            tips.push('Add dates to all experiences');
        }

        // No empty sections (deduct 2 pts)
        const hasEmptyAchievements = profile.experience.some(exp => 
            exp.achievements.length === 1 && !exp.achievements[0]
        );
        if (hasEmptyAchievements) {
            score -= 2;
            tips.push('Remove or fill empty achievement bullets');
        }

        // Text quality checks - collect all text content
        const allText = [
            profile.summary?.content || '',
            ...profile.experience.flatMap(exp => [
                exp.position || '',
                exp.company || '',
                exp.description || '',
                ...exp.achievements
            ]),
            ...profile.education.flatMap(edu => [
                edu.degree || '',
                edu.institution || '',
                edu.fieldOfStudy || ''
            ]),
            ...profile.projects.flatMap(proj => [
                proj.name || '',
                proj.description || '',
                proj.role || '',
                ...proj.achievements
            ])
        ].join(' ').toLowerCase();

        // Word quality check - look for very short or suspiciously incomplete words (deduct 1 pt)
        const words = allText.split(/\s+/).filter(w => w.length > 0);
        const suspiciousWords = words.filter(w => {
            // Words that are 2-4 chars but don't look like common short words
            if (w.length >= 2 && w.length <= 4) {
                const commonShortWords = ['a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 
                    'do', 'does', 'did', 'will', 'can', 'may', 'must', 'to', 'of', 'in', 'on', 'at', 'by', 'for', 'with',
                    'from', 'as', 'or', 'and', 'but', 'not', 'my', 'our', 'his', 'her', 'its', 'all', 'any', 'each', 'some',
                    'web', 'app', 'api', 'sql', 'aws', 'gcp', 'css', 'html', 'php', 'java', 'c++', 'ios', 'ux', 'ui', 'seo',
                    'led', 'ran', 'made', 'built', 'grew', 'cut', 'won', 'got', 'set', 'put', 'took', 'gave', 'kept', 'held',
                    'year', 'team', 'role', 'work', 'code', 'data', 'user', 'test', 'plan', 'tool', 'file', 'page', 'site'];
                return !commonShortWords.includes(w);
            }
            return false;
        });
        
        // Check for common obvious typos with specific feedback and location
        const typoMap: Record<string, string> = {
            'teh': 'the',
            'recieve': 'receive',
            'occured': 'occurred',
            'seperate': 'separate',
            'definate': 'definite',
            'managment': 'management',
            'developement': 'development',
            'experiance': 'experience',
            'responsable': 'responsible',
            'compnay': 'company',
            'projcet': 'project',
            'skils': 'skills',
            'experinece': 'experience'
        };
        
        // Find typos and their locations
        Object.keys(typoMap).forEach(typo => {
            const correction = typoMap[typo];
            
            // Check in summary
            if (profile.summary?.content?.toLowerCase().includes(typo)) {
                score -= 1;
                tips.push(`Fix spelling: "${typo}" → "${correction}"`);
                actionableTips.push({
                    message: `Fix spelling: "${typo}" → "${correction}"`,
                    section: 'summary',
                    field: 'content',
                    originalText: typo,
                    suggestedText: correction,
                    canAutoFix: true
                });
            }
            
            // Check in experience
            profile.experience.forEach(exp => {
                const expText = (exp.description + ' ' + exp.achievements.join(' ')).toLowerCase();
                if (expText.includes(typo)) {
                    score -= 1;
                    tips.push(`Fix spelling in ${exp.company}: "${typo}" → "${correction}"`);
                    actionableTips.push({
                        message: `Fix spelling: "${typo}" → "${correction}"`,
                        section: 'experience',
                        field: 'description',
                        itemId: exp.id,
                        originalText: typo,
                        suggestedText: correction,
                        canAutoFix: true
                    });
                }
            });
            
            // Check in projects
            profile.projects.forEach(proj => {
                const projText = (proj.description + ' ' + proj.achievements.join(' ')).toLowerCase();
                if (projText.includes(typo)) {
                    score -= 1;
                    tips.push(`Fix spelling in ${proj.name}: "${typo}" → "${correction}"`);
                    actionableTips.push({
                        message: `Fix spelling: "${typo}" → "${correction}"`,
                        section: 'projects',
                        field: 'description',
                        itemId: proj.id,
                        originalText: typo,
                        suggestedText: correction,
                        canAutoFix: true
                    });
                }
            });
        });
        
        // Add feedback for suspicious incomplete words
        if (suspiciousWords.length > 3) {
            score -= 1;
            const examples = suspiciousWords.slice(0, 3).join(', ');
            tips.push(`Check for incomplete words: "${examples}"${suspiciousWords.length > 3 ? ` (+${suspiciousWords.length - 3} more)` : ''}`);
        }

        // Unprofessional language with specific examples (deduct 2 pts)
        const unprofessionalMap: Record<string, string> = {
            'stuff': 'items/materials/components',
            'things': 'tasks/items/elements',
            'basically': 'remove or rephrase',
            'kinda': 'somewhat/rather',
            'sorta': 'somewhat/rather',
            'lots of': 'many/numerous',
            'a lot of': 'many/numerous',
            'pretty': 'very/quite',
        };
        
        const foundUnprofessional: string[] = [];
        Object.keys(unprofessionalMap).forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'i');
            if (regex.test(allText)) {
                foundUnprofessional.push(`"${word}" → ${unprofessionalMap[word]}`);
            }
        });
        
        if (foundUnprofessional.length > 0) {
            score -= 2;
            foundUnprofessional.forEach(issue => {
                tips.push(`Replace informal language: ${issue}`);
            });
        }

        // Inconsistent capitalization with actionable tips (deduct 2 pts)
        let hasCapIssues = false;
        
        if (profile.contact.firstName && profile.contact.firstName[0] !== profile.contact.firstName[0].toUpperCase()) {
            hasCapIssues = true;
            const capitalized = profile.contact.firstName.charAt(0).toUpperCase() + profile.contact.firstName.slice(1);
            tips.push(`First name should start with capital: "${profile.contact.firstName}"`);
            actionableTips.push({
                message: `Capitalize first name: "${profile.contact.firstName}" → "${capitalized}"`,
                section: 'contact',
                field: 'firstName',
                originalText: profile.contact.firstName,
                suggestedText: capitalized,
                canAutoFix: true
            });
        }
        if (profile.contact.lastName && profile.contact.lastName[0] !== profile.contact.lastName[0].toUpperCase()) {
            hasCapIssues = true;
            const capitalized = profile.contact.lastName.charAt(0).toUpperCase() + profile.contact.lastName.slice(1);
            tips.push(`Last name should start with capital: "${profile.contact.lastName}"`);
            actionableTips.push({
                message: `Capitalize last name: "${profile.contact.lastName}" → "${capitalized}"`,
                section: 'contact',
                field: 'lastName',
                originalText: profile.contact.lastName,
                suggestedText: capitalized,
                canAutoFix: true
            });
        }
        
        profile.experience.forEach((exp) => {
            if (exp.position && exp.position[0] !== exp.position[0].toUpperCase()) {
                hasCapIssues = true;
                const capitalized = exp.position.charAt(0).toUpperCase() + exp.position.slice(1);
                tips.push(`Job title should be capitalized: "${exp.position}"`);
                actionableTips.push({
                    message: `Capitalize job title: "${exp.position}" → "${capitalized}"`,
                    section: 'experience',
                    field: 'position',
                    itemId: exp.id,
                    originalText: exp.position,
                    suggestedText: capitalized,
                    canAutoFix: true
                });
            }
            if (exp.company && exp.company[0] !== exp.company[0].toUpperCase()) {
                hasCapIssues = true;
                const capitalized = exp.company.charAt(0).toUpperCase() + exp.company.slice(1);
                tips.push(`Company name should be capitalized: "${exp.company}"`);
                actionableTips.push({
                    message: `Capitalize company: "${exp.company}" → "${capitalized}"`,
                    section: 'experience',
                    field: 'company',
                    itemId: exp.id,
                    originalText: exp.company,
                    suggestedText: capitalized,
                    canAutoFix: true
                });
            }
        });
        
        if (hasCapIssues) {
            score -= 2;
        }

        console.log('  ✅ Professional Polish:', Math.max(0, score), '/10', 
            actionableTips.length > 0 ? `(${actionableTips.length} fixes available)` : '');

        return {
            label: 'Professional Polish',
            score: Math.max(0, score),
            maxScore: 10,
            description: 'Formatting, consistency, and presentation quality',
            tips,
            actionableTips,
            status: (score >= 9 ? 'excellent' : score >= 7 ? 'good' : score >= 4 ? 'needs-work' : 'critical') as any
        };
    })();
    categories.push(polishScore);

    // Calculate totals
    const totalScore = categories.reduce((sum, cat) => sum + cat.score, 0);
    const maxTotalScore = categories.reduce((sum, cat) => sum + cat.maxScore, 0);
    const percentage = Math.round((totalScore / maxTotalScore) * 100);
    
    console.log('📊 [ResumeScore] FINAL:', percentage + '%', `(${totalScore}/${maxTotalScore})`, 
        `Grade: ${percentage >= 90 ? 'A' : percentage >= 80 ? 'B' : percentage >= 70 ? 'C' : percentage >= 60 ? 'D' : 'F'}`);

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
