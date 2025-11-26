import { ResumeProfile } from './resume-schema';

export interface ScoreCategory {
    label: string;
    score: number;
    maxScore: number;
    weight: number;
    tips: string[];
    status: 'complete' | 'partial' | 'missing';
}

export function calculateResumeScore(profile: ResumeProfile): {
    categories: ScoreCategory[];
    totalScore: number;
    maxTotalScore: number;
} {
    const categories: ScoreCategory[] = [];

    // Contact Info (20 points)
    const contactScore = (() => {
        let score = 0;
        const tips: string[] = [];
        if (profile.contact.firstName && profile.contact.lastName) score += 5;
        else tips.push('Add your full name');
        if (profile.contact.email) score += 5;
        else tips.push('Add your email address');
        if (profile.contact.phone) score += 5;
        else tips.push('Add your phone number');
        if (profile.contact.location) score += 3;
        else tips.push('Add your location');
        if (profile.contact.linkedin || profile.contact.github || profile.contact.website) score += 2;
        else tips.push('Add LinkedIn or portfolio link');

        return {
            label: 'Contact Info',
            score,
            maxScore: 20,
            weight: 20,
            tips,
            status: (score === 20 ? 'complete' : score > 10 ? 'partial' : 'missing') as 'complete' | 'partial' | 'missing'
        };
    })();
    categories.push(contactScore);

    // Summary (15 points)
    const summaryScore = (() => {
        let score = 0;
        const tips: string[] = [];
        const content = profile.summary?.content || '';

        if (content.length > 50) score += 10;
        else if (content.length > 0) {
            score += 5;
            tips.push('Expand your summary to at least 50 characters');
        } else {
            tips.push('Add a professional summary');
        }

        if (content.length > 100) score += 5;
        else if (content.length > 0) tips.push('Add more detail to your summary (aim for 100+ characters)');

        return {
            label: 'Summary',
            score,
            maxScore: 15,
            weight: 15,
            tips,
            status: (score === 15 ? 'complete' : score > 5 ? 'partial' : 'missing') as 'complete' | 'partial' | 'missing'
        };
    })();
    categories.push(summaryScore);

    // Experience (25 points)
    const experienceScore = (() => {
        let score = 0;
        const tips: string[] = [];
        const expCount = profile.experience.length;

        if (expCount >= 2) score += 10;
        else if (expCount === 1) {
            score += 5;
            tips.push('Add at least 2 work experiences');
        } else {
            tips.push('Add your work experience');
        }

        const hasDescriptions = profile.experience.some(exp => exp.description && exp.description.length > 50);
        if (hasDescriptions) score += 10;
        else if (expCount > 0) tips.push('Add detailed descriptions to your experiences');

        const hasAchievements = profile.experience.some(exp => exp.achievements && exp.achievements.length > 0);
        if (hasAchievements) score += 5;
        else if (expCount > 0) tips.push('List specific achievements in bullet points');

        return {
            label: 'Experience',
            score,
            maxScore: 25,
            weight: 60,
            tips,
            status: (score === 25 ? 'complete' : score > 10 ? 'partial' : 'missing') as 'complete' | 'partial' | 'missing'
        };
    })();
    categories.push(experienceScore);

    // Education (15 points)
    const educationScore = (() => {
        let score = 0;
        const tips: string[] = [];
        const eduCount = profile.education.length;

        if (eduCount >= 1) score += 10;
        else tips.push('Add your education');

        const hasComplete = profile.education.some(edu =>
            edu.institution && edu.degree && edu.fieldOfStudy
        );
        if (hasComplete) score += 5;
        else if (eduCount > 0) tips.push('Complete all education fields (degree, institution, field)');

        return {
            label: 'Education',
            score,
            maxScore: 15,
            weight: 15,
            tips,
            status: (score === 15 ? 'complete' : score > 5 ? 'partial' : 'missing') as 'complete' | 'partial' | 'missing'
        };
    })();
    categories.push(educationScore);

    // Skills (15 points)
    const skillsScore = (() => {
        let score = 0;
        const tips: string[] = [];
        const totalSkills = [
            ...profile.skills.technical,
            ...profile.skills.soft,
            ...profile.skills.tools
        ].length;

        if (totalSkills >= 5) score += 10;
        else if (totalSkills > 0) {
            score += 5;
            tips.push('Add at least 5 skills');
        } else {
            tips.push('Add your technical and soft skills');
        }

        if (profile.skills.technical.length > 0 && profile.skills.soft.length > 0) score += 5;
        else tips.push('Include both technical and soft skills');

        return {
            label: 'Skills',
            score,
            maxScore: 15,
            weight: 15,
            tips,
            status: (score === 15 ? 'complete' : score > 5 ? 'partial' : 'missing') as 'complete' | 'partial' | 'missing'
        };
    })();
    categories.push(skillsScore);

    // Projects (10 points)
    const projectsScore = (() => {
        let score = 0;
        const tips: string[] = [];
        const projCount = profile.projects.length;

        if (projCount >= 2) score += 7;
        else if (projCount === 1) {
            score += 3;
            tips.push('Add at least 2 projects to showcase your work');
        } else {
            tips.push('Add projects to demonstrate your skills');
        }

        const hasDescriptions = profile.projects.some(proj => proj.description && proj.description.length > 30);
        if (hasDescriptions) score += 3;
        else if (projCount > 0) tips.push('Add detailed descriptions to your projects');

        return {
            label: 'Projects',
            score,
            maxScore: 10,
            weight: 10,
            tips,
            status: (score === 10 ? 'complete' : score > 3 ? 'partial' : 'missing') as 'complete' | 'partial' | 'missing'
        };
    })();
    categories.push(projectsScore);

    const totalScore = Math.round(categories.reduce((sum, cat) => sum + cat.score, 0));
    const maxTotalScore = categories.reduce((sum, cat) => sum + cat.maxScore, 0);

    return {
        categories,
        totalScore,
        maxTotalScore
    };
}
