'use client';

import { ResumeProfile, SectionType } from '@/lib/resume-schema';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Github, Linkedin, Mail, MapPin, Phone, Globe } from 'lucide-react';
import { useResumeSettings } from '@/lib/resume-settings-context';

interface FullPageResumePreviewProps {
  profile: ResumeProfile;
  sectionVisibility?: { [key: string]: boolean };
  isSplitView?: boolean;
}

export function FullPageResumePreview({
  profile,
  sectionVisibility = {
    contact: true,
    summary: true,
    experience: true,
    education: true,
    projects: true,
    skills: true,
    certifications: true,
    volunteer: true,
    awards: true,
    publications: true,
    languages: true,
    references: true,
    interests: true
  },
  isSplitView = false
}: FullPageResumePreviewProps) {
  const { settings } = useResumeSettings();
  const { font, layout, template } = settings;

  const isModern = template === 'Modern';
  const isProfessional = template === 'Professional';
  const isCreative = template === 'Creative';

  // Dynamic styles based on settings
  const containerStyle = {
    fontFamily: font.primary,
    lineHeight: `${font.lineSpacing}%`,
    paddingTop: `${layout.margins.top}in`,
    paddingBottom: `${layout.margins.bottom}in`,
    paddingLeft: `${layout.margins.left}in`,
    paddingRight: `${layout.margins.right}in`,
  };

  const headingStyle = {
    fontSize: `${(24 * font.headingSize) / 100}px`,
    marginBottom: `${layout.padding.title}px`,
  };

  const subHeadingStyle = {
    fontSize: `${(14 * font.headingSize) / 100}px`,
    marginBottom: `${layout.padding.content}px`,
    color: isModern ? '#2563eb' : '#2d3748', // Blue for Modern
    borderBottom: isProfessional ? '2px solid #000' : isModern ? 'none' : '1px solid #cbd5e1',
    backgroundColor: isModern ? '#eff6ff' : 'transparent',
    padding: isModern ? '4px 8px' : '0 0 4px 0',
    borderRadius: isModern ? '4px' : '0',
  };

  const bodyStyle = {
    fontSize: `${(11 * font.bodySize) / 100}px`,
    fontFamily: font.secondary,
  };

  const sectionStyle = {
    marginBottom: `${layout.padding.section}px`,
  };

  // Helper to render sections
  const renderSection = (key: SectionType) => {
    switch (key) {
      case 'summary':
        return sectionVisibility.summary && profile.summary?.content && (
          <div key="summary" style={sectionStyle}>
            <h2 className="font-bold uppercase tracking-wider mb-2" style={subHeadingStyle}>
              Summary
            </h2>
            <p className="text-slate-700 leading-relaxed" style={bodyStyle}>
              {profile.summary.content}
            </p>
          </div>
        );

      case 'experience':
        return sectionVisibility.experience && profile.experience.length > 0 && (
          <div key="experience" style={sectionStyle}>
            <h2 className="font-bold uppercase tracking-wider mb-3" style={subHeadingStyle}>
              Experience
            </h2>
            <div className="space-y-4">
              {profile.experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-slate-900" style={{ fontSize: `${(12 * font.bodySize) / 100}px` }}>{exp.position}</h3>
                    <span className="text-slate-600 whitespace-nowrap" style={bodyStyle}>
                      {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-slate-800" style={bodyStyle}>{exp.company}</span>
                    <span className="text-slate-600" style={bodyStyle}>{exp.location}</span>
                  </div>
                  {exp.description && (
                    <p className="text-slate-700 mb-2" style={bodyStyle}>{exp.description}</p>
                  )}
                  {exp.achievements && exp.achievements.length > 0 && (
                    <ul className="list-disc list-inside text-slate-700 space-y-1 ml-2">
                      {exp.achievements.map((achievement, i) => (
                        <li key={i} style={bodyStyle}>{achievement}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'education':
        return sectionVisibility.education && profile.education.length > 0 && (
          <div key="education" style={sectionStyle}>
            <h2 className="font-bold uppercase tracking-wider mb-3" style={subHeadingStyle}>
              Education
            </h2>
            <div className="space-y-3">
              {profile.education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-slate-900" style={{ fontSize: `${(12 * font.bodySize) / 100}px` }}>{edu.institution}</h3>
                    <span className="text-slate-600 whitespace-nowrap" style={bodyStyle}>
                      {edu.startDate} – {edu.current ? 'Present' : edu.endDate}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-800" style={bodyStyle}>{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</span>
                    <span className="text-slate-600" style={bodyStyle}>{edu.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'projects':
        return sectionVisibility.projects && profile.projects.length > 0 && (
          <div key="projects" style={sectionStyle}>
            <h2 className="font-bold uppercase tracking-wider mb-3" style={subHeadingStyle}>
              Projects
            </h2>
            <div className="space-y-3">
              {profile.projects.map((project) => (
                <div key={project.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900" style={{ fontSize: `${(12 * font.bodySize) / 100}px` }}>{project.name}</h3>
                      {project.url && (
                        <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
                          Link
                        </a>
                      )}
                    </div>
                    <span className="text-slate-600 whitespace-nowrap" style={bodyStyle}>
                      {project.startDate} – {project.current ? 'Present' : project.endDate}
                    </span>
                  </div>
                  <p className="text-slate-700 mb-2" style={bodyStyle}>{project.description}</p>
                  {project.achievements && project.achievements.length > 0 && (
                    <ul className="list-disc list-inside text-slate-700 space-y-1 ml-2">
                      {project.achievements.map((highlight, i) => (
                        <li key={i} style={bodyStyle}>{highlight}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'skills':
        if (!sectionVisibility.skills || Object.keys(profile.skills).length === 0) return null;

        // Clone and sort skills
        const skillsToRender = JSON.parse(JSON.stringify(profile.skills));
        if (layout.skillsSort !== 'none') {
          Object.keys(skillsToRender).forEach(key => {
            if (Array.isArray(skillsToRender[key])) {
              skillsToRender[key].sort((a: string, b: string) => {
                return layout.skillsSort === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
              });
            }
          });
        }

        return (
          <div key="skills" style={sectionStyle}>
            <h2 className="font-bold uppercase tracking-wider mb-3" style={subHeadingStyle}>
              Skills
            </h2>
            {layout.skillsLayout === 'columns' ? (
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(skillsToRender).map(([category, skills]) => (
                  <div key={category}>
                    <h3 className="font-bold text-slate-800 mb-1 capitalize" style={bodyStyle}>{category}</h3>
                    <ul className="list-disc list-inside">
                      {(skills as string[]).map(skill => (
                        <li key={skill} style={bodyStyle}>{skill}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {Object.entries(skillsToRender).map(([category, skills]) => (
                  <div key={category} className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                    <span className="font-bold text-slate-800 min-w-[120px] capitalize" style={bodyStyle}>{category}:</span>
                    <span className="text-slate-700" style={bodyStyle}>
                      {(skills as string[]).join(', ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'languages':
        return sectionVisibility.languages && profile.languages.length > 0 && (
          <div key="languages" style={sectionStyle}>
            <h2 className="font-bold uppercase tracking-wider mb-3" style={subHeadingStyle}>
              Languages
            </h2>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {profile.languages.map((lang, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="font-medium text-slate-900" style={bodyStyle}>{lang.name}</span>
                  {lang.proficiency && (
                    <span className="text-slate-600" style={bodyStyle}>({lang.proficiency})</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'certifications':
        return sectionVisibility.certifications && profile.certifications && profile.certifications.length > 0 && (
          <div key="certifications" style={sectionStyle}>
            <h2 className="font-bold uppercase tracking-wider mb-3" style={subHeadingStyle}>
              Certifications
            </h2>
            <div className="space-y-2">
              {profile.certifications.map((cert, index) => (
                <div key={index} className="flex justify-between items-baseline">
                  <div>
                    <span className="font-bold text-slate-900" style={bodyStyle}>{cert.name}</span>
                    <span className="text-slate-700 mx-2" style={bodyStyle}>-</span>
                    <span className="text-slate-700" style={bodyStyle}>{cert.issuer}</span>
                  </div>
                  <span className="text-slate-600" style={bodyStyle}>{cert.date}</span>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="bg-white shadow-lg mx-auto transition-all duration-300 ease-in-out"
      style={{
        width: layout.format === 'A4' ? '210mm' : '8.5in',
        minHeight: layout.format === 'A4' ? '297mm' : '11in',
        ...containerStyle
      }}
    >
      {/* Header Section (Always Top) */}
      {sectionVisibility.contact && (
        <div style={{
          textAlign: layout.headerAlignment,
          ...sectionStyle,
          ...(isModern ? {
            backgroundColor: '#f8fafc',
            padding: '24px',
            borderRadius: '8px',
            marginBottom: `${layout.padding.section + 12}px`,
            borderBottom: '2px solid #3b82f6'
          } : {})
        }}>
          <h1 style={{ ...headingStyle, fontWeight: 'bold', color: '#1a202c' }}>
            {profile.contact.firstName} {profile.contact.lastName}
          </h1>

          <div className={`flex flex-wrap gap-4 text-sm text-slate-600 mt-2 ${layout.headerAlignment === 'center' ? 'justify-center' :
            layout.headerAlignment === 'right' ? 'justify-end' : 'justify-start'
            }`} style={bodyStyle}>
            {profile.contact.email && (
              <div className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                <span>{profile.contact.email}</span>
              </div>
            )}
            {profile.contact.phone && (
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                <span>{profile.contact.phone}</span>
              </div>
            )}
            {profile.contact.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{profile.contact.location}</span>
              </div>
            )}
            {profile.contact.linkedin && (
              <div className="flex items-center gap-1">
                <Linkedin className="w-3 h-3" />
                <a href={profile.contact.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  LinkedIn
                </a>
              </div>
            )}
            {profile.contact.website && (
              <div className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                <a href={profile.contact.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  Portfolio
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dynamic Sections */}
      {layout.sectionOrder.map(key => renderSection(key))}
    </div>
  );
}
