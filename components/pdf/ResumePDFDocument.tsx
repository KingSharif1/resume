import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Link } from '@react-pdf/renderer';
import { ResumeProfile, SectionType } from '@/lib/resume-schema';

// Register fonts
Font.register({
    family: 'Inter',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.ttf', fontWeight: 400 },
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hjp-Ek-_EeA.ttf', fontWeight: 500 },
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hjp-Ek-_EeA.ttf', fontWeight: 600 },
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hjp-Ek-_EeA.ttf', fontWeight: 700 },
    ],
});

// Create styles
const styles = StyleSheet.create({
    page: {
        padding: '36px', // 0.5 inch margins as standard
        fontFamily: 'Inter',
        fontSize: 10,
        color: '#374151', // slate-700
        lineHeight: 1.5,
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#2563eb', // blue-600
        paddingBottom: 16,
    },
    name: {
        fontSize: 24,
        fontWeight: 700,
        color: '#1a202c', // slate-900
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    contactRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        fontSize: 9,
        color: '#4b5563', // slate-600
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 700,
        color: '#2563eb', // blue-600
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0', // slate-200
        paddingBottom: 4,
    },
    entryTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 2,
    },
    entryTitle: {
        fontSize: 11,
        fontWeight: 600,
        color: '#1a202c', // slate-900
    },
    entryDate: {
        fontSize: 9,
        color: '#64748b', // slate-500
        fontWeight: 500,
    },
    entrySubtitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    entrySubtitle: {
        fontSize: 10,
        fontWeight: 500,
        color: '#334155', // slate-700
    },
    entryLocation: {
        fontSize: 9,
        color: '#64748b', // slate-500
        fontStyle: 'italic',
    },
    description: {
        marginBottom: 4,
        textAlign: 'justify',
    },
    bulletList: {
        marginLeft: 12,
    },
    bulletItem: {
        flexDirection: 'row',
        marginBottom: 2,
    },
    bulletPoint: {
        width: 10,
        fontSize: 10,
        color: '#2563eb', // blue-600
    },
    bulletContent: {
        flex: 1,
    },
    skillsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    skillCategory: {
        marginBottom: 4,
    },
    skillCategoryTitle: {
        fontWeight: 600,
        fontSize: 10,
        color: '#1a202c', // slate-900
        marginBottom: 2,
    },
    skillList: {
        fontSize: 10,
        color: '#4b5563', // slate-600
    },
    link: {
        color: '#2563eb',
        textDecoration: 'none',
    }
});

interface ResumePDFDocumentProps {
    profile: ResumeProfile;
}

export const ResumePDFDocument: React.FC<ResumePDFDocumentProps> = ({ profile }) => {
    // Helper to check if section has content
    const hasContent = (section: SectionType) => {
        switch (section) {
            case 'summary': return !!profile.summary?.content;
            case 'experience': return profile.experience?.length > 0;
            case 'education': return profile.education?.length > 0;
            case 'projects': return profile.projects?.length > 0;
            case 'skills': return Object.keys(profile.skills || {}).length > 0;
            case 'languages': return profile.languages?.length > 0;
            case 'certifications': return profile.certifications?.length > 0;
            case 'awards': return profile.awards?.length > 0;
            case 'volunteer': return profile.volunteer?.length > 0;
            // Add others as needed
            default: return false;
        }
    };

    const renderSummary = () => (
        <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.description}>{profile.summary?.content}</Text>
        </View>
    );

    const renderExperience = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {profile.experience.filter(exp => exp.visible !== false).map((exp, index) => (
                <View key={index} style={{ marginBottom: 10 }} wrap={false}>
                    <View style={styles.entryTitleRow}>
                        <Text style={styles.entryTitle}>{exp.position}</Text>
                        <Text style={styles.entryDate}>
                            {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                        </Text>
                    </View>
                    <View style={styles.entrySubtitleRow}>
                        <Text style={styles.entrySubtitle}>{exp.company}</Text>
                        <Text style={styles.entryLocation}>{exp.location}</Text>
                    </View>
                    {exp.description && (
                        <Text style={styles.description}>{exp.description}</Text>
                    )}
                    {exp.achievements && exp.achievements.length > 0 && (
                        <View style={styles.bulletList}>
                            {exp.achievements.map((achievement, i) => (
                                <View key={i} style={styles.bulletItem}>
                                    <Text style={styles.bulletPoint}>•</Text>
                                    <Text style={styles.bulletContent}>{achievement}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            ))}
        </View>
    );

    const renderEducation = () => (
        <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>Education</Text>
            {profile.education.filter(edu => edu.visible !== false).map((edu, index) => (
                <View key={index} style={{ marginBottom: 8 }}>
                    <View style={styles.entryTitleRow}>
                        <Text style={styles.entryTitle}>{edu.institution}</Text>
                        <Text style={styles.entryDate}>
                            {edu.startDate} – {edu.current ? 'Present' : edu.endDate}
                        </Text>
                    </View>
                    <View style={styles.entrySubtitleRow}>
                        <Text style={styles.entrySubtitle}>
                            {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}
                        </Text>
                        <Text style={styles.entryLocation}>{edu.location}</Text>
                    </View>
                    {edu.gpa && <Text style={{ fontSize: 9, color: '#64748b' }}>GPA: {edu.gpa}</Text>}
                </View>
            ))}
        </View>
    );

    const renderSkills = () => {
        // If using default columns or simple list
        const entries = Object.entries(profile.skills);
        if (entries.length === 0) return null;

        return (
            <View style={styles.section} wrap={false}>
                <Text style={styles.sectionTitle}>Skills</Text>
                <View style={styles.skillsGrid}>
                    {entries.map(([category, skills]) => (
                        <View key={category} style={styles.skillCategory}>
                            <Text style={styles.skillCategoryTitle}>{category}:</Text>
                            <Text style={styles.skillList}>
                                {(skills as string[]).join(', ')}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    const renderProjects = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {profile.projects.filter(proj => proj.visible !== false).map((project, index) => (
                <View key={index} style={{ marginBottom: 10 }} wrap={false}>
                    <View style={styles.entryTitleRow}>
                        <View style={{ flexDirection: 'row', gap: 4 }}>
                            <Text style={styles.entryTitle}>{project.name}</Text>
                            {project.url && (
                                <Link src={project.url} style={{ fontSize: 9, color: '#2563eb' }}>
                                    Link ↗
                                </Link>
                            )}
                        </View>
                        <Text style={styles.entryDate}>
                            {project.startDate} – {project.current ? 'Present' : project.endDate}
                        </Text>
                    </View>
                    {project.technologies && project.technologies.length > 0 && (
                        <Text style={{ fontSize: 9, fontStyle: 'italic', marginBottom: 2, color: '#64748b' }}>
                            {project.technologies.join(', ')}
                        </Text>
                    )}
                    <Text style={styles.description}>{project.description}</Text>
                    {project.achievements && project.achievements.length > 0 && (
                        <View style={styles.bulletList}>
                            {project.achievements.map((achievement, i) => (
                                <View key={i} style={styles.bulletItem}>
                                    <Text style={styles.bulletPoint}>•</Text>
                                    <Text style={styles.bulletContent}>{achievement}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            ))}
        </View>
    );

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.name}>
                        {profile.contact.firstName} {profile.contact.middleName ? `${profile.contact.middleName} ` : ''}{profile.contact.lastName}
                    </Text>
                    <View style={styles.contactRow}>
                        {profile.contact.email && <Text>{profile.contact.email}  |</Text>}
                        {profile.contact.phone && <Text>{profile.contact.phone}  |</Text>}
                        {profile.contact.location && <Text>{profile.contact.location}</Text>}
                        {profile.contact.linkedin && (
                            <Text> |  LinkedIn: {profile.contact.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</Text>
                        )}
                        {profile.contact.website && (
                            <Text> |  Portfolio: {profile.contact.website.replace(/^https?:\/\/(www\.)?/, '')}</Text>
                        )}
                    </View>
                </View>

                {/* Dynamic Sections (Order could be customizable, fixed for now) */}
                {hasContent('summary') && renderSummary()}
                {hasContent('experience') && renderExperience()}
                {hasContent('education') && renderEducation()}
                {hasContent('projects') && renderProjects()}
                {hasContent('skills') && renderSkills()}
            </Page>
        </Document>
    );
};

export default ResumePDFDocument;
