'use client';

import { useState } from 'react';
import { ResumeProfile, SectionType } from '@/lib/resume-schema';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Github, Linkedin, Mail, MapPin, Phone, Globe, Sparkles, Layout } from 'lucide-react';
import { useResumeSettings } from '@/lib/resume-settings-context';
import { cn } from '@/lib/utils';

import { HighlightedText } from '@/components/HighlightedText';
import { InlineSuggestion } from '@/lib/inline-suggestions';
import { useSuggestionHover } from '@/lib/suggestion-hover-context';
import { scrollToSuggestionCard } from '@/lib/scroll-utils';

interface FullPageResumePreviewProps {
  profile: ResumeProfile;
  sectionVisibility?: { [key: string]: boolean };
  isSplitView?: boolean;
  onTemplateChange?: () => void;
  onLayoutChange?: () => void;
  inlineSuggestions?: InlineSuggestion[];
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
  isSplitView = false,
  onTemplateChange,
  onLayoutChange,
  inlineSuggestions = []
}: FullPageResumePreviewProps) {
  const { settings, updateFontSettings, updateThemeSettings } = useResumeSettings();
  const { font, layout, template, theme } = settings;
  const [zoomLevel, setZoomLevel] = useState(70);
  const { hoveredSuggestionId, setHoveredHighlight, activeSuggestionId, setActiveSuggestionId } = useSuggestionHover();

  const isModern = template === 'Modern';
  const isProfessional = template === 'Professional';
  const isCreative = template === 'Creative';

  const accentColor = theme?.accentColor || '#000000';

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

  // Helper to render text with highlights
  const renderWithHighlights = (text: string, section: SectionType, itemId?: string, field?: string) => {
    if (!text) return null;

    // If no suggestions at all, return plain text
    if (!inlineSuggestions || inlineSuggestions.length === 0) {
      return text;
    }

    // Filter suggestions for this specific field - be flexible with matching
    const relevantSuggestions = inlineSuggestions.filter(s => {
      // Must match section (case-insensitive)
      if (s.targetSection.toLowerCase() !== section.toLowerCase()) return false;

      // If suggestion specifies itemId, it must match (or itemId can be undefined for general section suggestions)
      if (s.targetItemId && itemId && s.targetItemId !== itemId) {
        return false;
      }

      // If suggestion specifies field, it must match (or field can be undefined)
      if (s.targetField && field && s.targetField !== field) {
        return false;
      }

      return true;
    });

    // Also check for suggestions that might match by originalText content
    // This helps when section/field matching is too strict
    const textMatchSuggestions = inlineSuggestions.filter(s => {
      if (relevantSuggestions.includes(s)) return false; // Already included
      if (!s.originalText) return false;
      // Check if the originalText exists in this text
      return text.includes(s.originalText) || 
             text.replace(/\s+/g, ' ').includes(s.originalText.replace(/\s+/g, ' '));
    });

    const allSuggestions = [...relevantSuggestions, ...textMatchSuggestions];

    // Always render HighlightedText if we have any suggestions for this section
    // This ensures the hover context is connected even if offsets need recalculation
    if (allSuggestions.length === 0) {
      // Check if ANY suggestion's originalText is in this text (fallback)
      const anyMatchingSuggestions = inlineSuggestions.filter(s => {
        if (!s.originalText) return false;
        const normalizedText = text.replace(/\s+/g, ' ').toLowerCase();
        const normalizedOriginal = s.originalText.replace(/\s+/g, ' ').toLowerCase();
        return normalizedText.includes(normalizedOriginal);
      });
      
      if (anyMatchingSuggestions.length > 0) {
        return (
          <HighlightedText
            text={text}
            suggestions={anyMatchingSuggestions}
            className=""
          />
        );
      }
      return text;
    }

    return (
      <HighlightedText
        text={text}
        suggestions={allSuggestions}
        className=""
      />
    );
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
            <div className="text-slate-700 leading-relaxed" style={bodyStyle}>
              {renderWithHighlights(profile.summary.content, 'summary', undefined, 'content')}
            </div>
          </div>
        );

      case 'experience':
        const visibleExperience = profile.experience.filter(exp => exp.visible !== false);
        return sectionVisibility.experience && visibleExperience.length > 0 && (
          <div key="experience" style={sectionStyle}>
            <h2 className="font-bold uppercase tracking-wider mb-3" style={subHeadingStyle}>
              Experience
            </h2>
            <div className="space-y-4">
              {visibleExperience.map((exp, index) => (
                <div key={exp.id || `exp-${index}`}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-slate-900" style={{ fontSize: `${(12 * font.bodySize) / 100}px` }}>
                      {renderWithHighlights(exp.position, 'experience', exp.id, 'position')}
                    </h3>
                    <span className="text-slate-600 whitespace-nowrap" style={bodyStyle}>
                      {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-slate-800" style={bodyStyle}>
                      {renderWithHighlights(exp.company, 'experience', exp.id, 'company')}
                    </span>
                    <span className="text-slate-600" style={bodyStyle}>{exp.location}</span>
                  </div>
                  {exp.description && (
                    <div className="text-slate-700 mb-2" style={bodyStyle}>
                      {renderWithHighlights(exp.description, 'experience', exp.id, 'description')}
                    </div>
                  )}
                  {exp.achievements && exp.achievements.length > 0 && (
                    <ul className="list-disc list-inside text-slate-700 space-y-1 ml-2">
                      {exp.achievements.map((achievement, i) => (
                        <li key={i} style={bodyStyle}>
                          {renderWithHighlights(achievement, 'experience', exp.id, `achievements[${i}]`)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'education':
        const visibleEducation = profile.education.filter(edu => edu.visible !== false);
        return sectionVisibility.education && visibleEducation.length > 0 && (
          <div key="education" style={sectionStyle}>
            <h2 className="font-bold uppercase tracking-wider mb-3" style={subHeadingStyle}>
              Education
            </h2>
            <div className="space-y-3">
              {visibleEducation.map((edu, index) => {
                // Build the combined education text for highlighting
                const combinedText = `${edu.degree}${edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''} from ${edu.institution}`;
                
                return (
                  <div key={edu.id || `edu-${index}`}>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="font-medium text-slate-800" style={bodyStyle}>
                        {renderWithHighlights(combinedText, 'education', edu.id, 'content')}
                      </span>
                      <span className="text-slate-600 whitespace-nowrap" style={bodyStyle}>
                        {edu.startDate} – {edu.current ? 'Present' : edu.endDate}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600" style={bodyStyle}>{edu.location}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'projects':
        const visibleProjects = profile.projects.filter(proj => proj.visible !== false);
        return sectionVisibility.projects && visibleProjects.length > 0 && (
          <div key="projects" style={sectionStyle}>
            <h2 className="font-bold uppercase tracking-wider mb-3" style={subHeadingStyle}>
              Projects
            </h2>
            <div className="space-y-3">
              {visibleProjects.map((project, index) => (
                <div key={project.id || `proj-${index}`}>
                  <div className="flex justify-between items-baseline mb-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900" style={{ fontSize: `${(12 * font.bodySize) / 100}px` }}>{project.name}</h3>
                      {project.url && (
                        <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
                          {project.url.replace(/^https?:\/\//, '')}
                        </a>
                      )}
                    </div>
                    <span className="text-slate-600 whitespace-nowrap" style={bodyStyle}>
                      {project.startDate} – {project.current ? 'Present' : project.endDate}
                    </span>
                  </div>
                  <div className="text-slate-700 mb-2" style={bodyStyle}>
                    {renderWithHighlights(project.description, 'projects', project.id, 'description')}
                  </div>
                  {project.achievements && project.achievements.length > 0 && (
                    <ul className="list-disc list-inside text-slate-700 space-y-1 ml-2">
                      {project.achievements.map((highlight, i) => (
                        <li key={i} style={bodyStyle}>
                          {renderWithHighlights(highlight, 'projects', project.id, `achievements[${i}]`)}
                        </li>
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

        // Get skills suggestions for highlighting
        const skillsSuggestions = inlineSuggestions.filter(s => 
          s.targetSection.toLowerCase() === 'skills'
        );

        // Helper to check if a skill should be highlighted
        const getSkillHighlight = (category: string, skill: string) => {
          const suggestion = skillsSuggestions.find(s => {
            // Try targetItemId first
            if (s.targetItemId === category) {
              return true;
            }
            
            // Extract category from originalText or suggestedText
            const text = s.originalText || s.suggestedText;
            if (text && text.includes(':')) {
              const extractedCategory = text.split(':')[0].trim();
              if (extractedCategory === category) {
                return true;
              }
            }
            
            return false;
          });
          
          if (!suggestion) {
            return null;
          }

          // Check if this specific skill is in the NEW suggestion (not in original)
          const suggestedSkillsText = suggestion.suggestedText.includes(':') 
            ? suggestion.suggestedText.split(':')[1] 
            : suggestion.suggestedText;
          
          const originalSkillsText = suggestion.originalText && suggestion.originalText.includes(':')
            ? suggestion.originalText.split(':')[1]
            : suggestion.originalText || '';
          
          // Parse skill lists
          const suggestedSkills = suggestedSkillsText.split(',').map(s => s.trim()).filter(Boolean);
          const originalSkills = originalSkillsText ? originalSkillsText.split(',').map(s => s.trim()).filter(Boolean) : [];
          
          // Only highlight if skill is in suggested but NOT in original (new skill)
          const isNewSkill = suggestedSkills.includes(skill) && !originalSkills.includes(skill);
          
          if (!isNewSkill) {
            return null;
          }

          const primaryType = suggestion.type.split(',')[0].trim().toLowerCase();
          const colors: Record<string, string> = {
            'ats': 'bg-blue-100 border-blue-400 text-blue-900',
            'metric': 'bg-green-100 border-green-400 text-green-900',
            'wording': 'bg-purple-100 border-purple-400 text-purple-900',
            'grammar': 'bg-red-100 border-red-400 text-red-900',
            'tone': 'bg-orange-100 border-orange-400 text-orange-900',
          };
          return colors[primaryType] || 'bg-gray-100 border-gray-400 text-gray-900';
        };

        return (
          <div key="skills" style={sectionStyle}>
            <h2 className="font-bold uppercase tracking-wider mb-3" style={subHeadingStyle}>
              Skills
            </h2>
            <div className="space-y-3">
              {Object.entries(profile.skills).map(([category, skills]) => {
                if (!skills || skills.length === 0) return null;
                
                // Check if there's a suggestion for this category
                const categorySuggestion = skillsSuggestions.find(s => {
                  if (s.targetItemId === category) return true;
                  const text = s.originalText || s.suggestedText;
                  if (text && text.includes(':')) {
                    const extractedCategory = text.split(':')[0].trim();
                    return extractedCategory === category;
                  }
                  return false;
                });

                // If there's a suggestion, get the suggested skills to show
                let displaySkills = skills as string[];
                if (categorySuggestion) {
                  const suggestedText = categorySuggestion.suggestedText;
                  const suggestedSkillsText = suggestedText.includes(':') ? suggestedText.split(':')[1] : suggestedText;
                  const suggestedSkills = suggestedSkillsText.split(',').map(s => s.trim()).filter(Boolean);
                  
                  // Show suggested skills (which includes both existing and new)
                  displaySkills = suggestedSkills;
                }
                
                return (
                  <div key={category}>
                    <h3 className="font-semibold text-slate-800 mb-1.5" style={bodyStyle}>
                      {category}:
                    </h3>
                    <div className="flex flex-wrap gap-x-2 gap-y-1.5">
                      {displaySkills.map((skill, idx) => {
                        const highlight = getSkillHighlight(category, skill);
                        
                        // Find the suggestion for this category to get the ID
                        const suggestion = categorySuggestion;
                        const isHovered = suggestion && hoveredSuggestionId === suggestion.id;
                        const isActive = suggestion && activeSuggestionId === suggestion.id;
                        
                        if (highlight) {
                          return (
                            <span
                              key={`${category}-${idx}`}
                              data-suggestion-id={suggestion?.id}
                              className={cn(
                                'px-2 py-0.5 rounded text-xs font-medium border-2 cursor-pointer transition-all duration-150',
                                highlight,
                                isHovered && 'ring-2 ring-offset-1',
                                isActive && 'ring-2 ring-offset-2'
                              )}
                              style={bodyStyle}
                              onMouseEnter={() => {
                                if (suggestion) {
                                  setHoveredHighlight(suggestion.id);
                                  scrollToSuggestionCard(suggestion.id);
                                }
                              }}
                              onMouseLeave={() => setHoveredHighlight(null)}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (suggestion) {
                                  setActiveSuggestionId(suggestion.id);
                                }
                              }}
                            >
                              {skill}
                            </span>
                          );
                        }
                        
                        return (
                          <span
                            key={`${category}-${idx}`}
                            className="text-slate-700"
                            style={bodyStyle}
                          >
                            {skill}
                            {idx < displaySkills.length - 1 && ', '}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
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
                <div key={lang.id || index} className="flex items-center gap-2">
                  <span className="font-medium text-slate-900" style={bodyStyle}>
                    {renderWithHighlights(lang.name, 'languages', lang.id, 'name')}
                  </span>
                  {lang.proficiency && (
                    <span className="text-slate-600" style={bodyStyle}>
                      ({renderWithHighlights(lang.proficiency, 'languages', lang.id, 'proficiency')})
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'certifications':
        const visibleCertifications = profile.certifications?.filter(cert => cert.visible !== false) || [];
        return sectionVisibility.certifications && visibleCertifications.length > 0 && (
          <div key="certifications" style={sectionStyle}>
            <h2 className="font-bold uppercase tracking-wider mb-3" style={subHeadingStyle}>
              Certifications
            </h2>
            <div className="space-y-2">
              {visibleCertifications.map((cert, index) => (
                <div key={cert.id || index} className="flex justify-between items-baseline">
                  <div>
                    <span className="font-bold text-slate-900" style={bodyStyle}>
                      {renderWithHighlights(cert.name, 'certifications', cert.id, 'name')}
                    </span>
                    <span className="text-slate-700 mx-2" style={bodyStyle}>-</span>
                    <span className="text-slate-700" style={bodyStyle}>
                      {renderWithHighlights(cert.issuer, 'certifications', cert.id, 'issuer')}
                    </span>
                  </div>
                  <span className="text-slate-600" style={bodyStyle}>{cert.date}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'volunteer':
        const visibleVolunteer = profile.volunteer?.filter(vol => vol.visible !== false) || [];
        return sectionVisibility.volunteer && visibleVolunteer.length > 0 && (
          <div key="volunteer" style={sectionStyle}>
            <h2 className="font-bold uppercase tracking-wider mb-3" style={subHeadingStyle}>
              Volunteer Experience
            </h2>
            <div className="space-y-3">
              {visibleVolunteer.map((vol, index) => (
                <div key={vol.id || index}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-slate-900" style={{ fontSize: `${(12 * font.bodySize) / 100}px` }}>
                      {renderWithHighlights(vol.role, 'volunteer', vol.id, 'role')}
                    </h3>
                    <span className="text-slate-600 whitespace-nowrap" style={bodyStyle}>
                      {vol.startDate} – {vol.current ? 'Present' : vol.endDate}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-slate-800" style={bodyStyle}>
                      {renderWithHighlights(vol.organization, 'volunteer', vol.id, 'organization')}
                    </span>
                  </div>
                  {vol.description && (
                    <div className="text-slate-700" style={bodyStyle}>
                      {renderWithHighlights(vol.description, 'volunteer', vol.id, 'description')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'references':
        const visibleReferences = profile.references?.filter(ref => ref.visible !== false) || [];
        return sectionVisibility.references && visibleReferences.length > 0 && (
          <div key="references" style={sectionStyle}>
            <h2 className="font-bold uppercase tracking-wider mb-3" style={subHeadingStyle}>
              References
            </h2>
            <div className="space-y-3">
              {visibleReferences.map((ref, index) => (
                <div key={ref.id || index}>
                  <div className="font-bold text-slate-900" style={bodyStyle}>
                    {renderWithHighlights(ref.name, 'references', ref.id, 'name')}
                  </div>
                  <div className="text-slate-700" style={bodyStyle}>
                    {renderWithHighlights(ref.title, 'references', ref.id, 'title')}
                  </div>
                  {ref.company && (
                    <div className="text-slate-700" style={bodyStyle}>
                      {renderWithHighlights(ref.company, 'references', ref.id, 'company')}
                    </div>
                  )}
                  {ref.email && (
                    <div className="text-slate-600" style={bodyStyle}>
                      {renderWithHighlights(ref.email, 'references', ref.id, 'email')}
                    </div>
                  )}
                  {ref.phone && (
                    <div className="text-slate-600" style={bodyStyle}>
                      {renderWithHighlights(ref.phone, 'references', ref.id, 'phone')}
                    </div>
                  )}
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
    <div className="flex flex-col items-center w-full relative">
      {/* Internal Toolbar - Island Style - Fixed Position */}
      <div className="sticky top-4 z-50 print:hidden w-full flex justify-center mb-8 px-4 pointer-events-none">
        <div className="bg-white border border-slate-200 rounded-xl rounded-b-none px-4 py-2.5 shadow-xl flex items-center gap-3 overflow-x-auto no-scrollbar max-w-fit pointer-events-auto">
          {onTemplateChange && (
            <>
              <Button variant="ghost" size="sm" className="h-8 text-slate-700 hover:bg-slate-50 whitespace-nowrap rounded-full px-3" onClick={onTemplateChange}>
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Template
              </Button>
              <div className="h-5 w-px bg-slate-200" />
            </>
          )}

          {onLayoutChange && (
            <>
              <Button variant="ghost" size="sm" className="h-8 text-slate-700 hover:bg-slate-50 whitespace-nowrap rounded-full px-3" onClick={onLayoutChange}>
                <Layout className="w-3.5 h-3.5 mr-1.5" />
                Layout
              </Button>
              <div className="h-5 w-px bg-slate-200" />
            </>
          )}

          {/* Font Family */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden lg:block">Font</span>
            <Select
              value={settings.font.primary}
              onValueChange={(value) => updateFontSettings({ primary: value as any, secondary: value as any })}
            >
              <SelectTrigger className="h-7 w-[100px] border-slate-200 text-xs rounded-full">
                <SelectValue placeholder="Font" />
              </SelectTrigger>
              <SelectContent>
                {['Inter', 'Roboto', 'Arial', 'Georgia', 'Times New Roman'].map(font => (
                  <SelectItem key={font} value={font} style={{ fontFamily: font }}>{font}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Font Size */}
          {/* <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden lg:block">Size</span>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-full h-7">
              <button
                className="px-2 hover:bg-slate-100 text-slate-600 h-full flex items-center justify-center rounded-l-full text-sm"
                onClick={() => updateFontSettings({ bodySize: Math.max(70, settings.font.bodySize - 5) })}
              >
                -
              </button>
              <span className="w-10 text-center text-xs font-medium text-slate-700">{settings.font.bodySize}%</span>
              <button
                className="px-2 hover:bg-slate-100 text-slate-600 h-full flex items-center justify-center rounded-r-full text-sm"
                onClick={() => updateFontSettings({ bodySize: Math.min(130, settings.font.bodySize + 5) })}
              >
                +
              </button>
            </div>
          </div> */}

          {/* Line Spacing */}
          {/* <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden lg:block">Spacing</span>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-full h-7">
              <button
                className="px-2 hover:bg-slate-100 text-slate-600 h-full flex items-center justify-center rounded-l-full text-sm"
                onClick={() => updateFontSettings({ lineSpacing: Math.max(80, settings.font.lineSpacing - 10) })}
              >
                -
              </button>
              <span className="w-10 text-center text-xs font-medium text-slate-700">{settings.font.lineSpacing}%</span>
              <button
                className="px-2 hover:bg-slate-100 text-slate-600 h-full flex items-center justify-center rounded-r-full text-sm"
                onClick={() => updateFontSettings({ lineSpacing: Math.min(200, settings.font.lineSpacing + 10) })}
              >
                +
              </button>
            </div>
          </div> */}

          <div className="h-5 w-px bg-slate-200" />

          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden lg:block">Zoom</span>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-full h-7">
              <button
                className="px-2 hover:bg-slate-100 text-slate-600 h-full flex items-center justify-center rounded-l-full text-sm"
                onClick={() => setZoomLevel(prev => Math.max(50, prev - 10))}
              >
                -
              </button>
              <span className="w-12 text-center text-xs font-medium text-slate-700">{zoomLevel}%</span>
              <button
                className="px-2 hover:bg-slate-100 text-slate-600 h-full flex items-center justify-center rounded-r-full text-sm"
                onClick={() => setZoomLevel(prev => Math.min(150, prev + 10))}
              >
                +
              </button>
            </div>
          </div>

          <div className="h-5 w-px bg-slate-200" />

          {/* Accent Color */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden lg:block">Color</span>
            <div className="flex items-center gap-1.5">
              {['#000000', '#2563eb', '#dc2626', '#16a34a', '#9333ea'].map((color) => (
                <button
                  key={color}
                  className={`w-5 h-5 rounded-full border border-slate-200 transition-all hover:scale-110 ${settings.theme?.accentColor === color ? 'ring-2 ring-offset-2 ring-slate-400' : ''
                    }`}
                  style={{ backgroundColor: color }}
                  onClick={() => updateThemeSettings && updateThemeSettings({ accentColor: color })}
                />
              ))}
              <div className="relative ml-1">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 p-[1px] cursor-pointer hover:scale-110 transition-transform">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                    <span className="text-[8px] font-bold">+</span>
                  </div>
                </div>
                <input
                  type="color"
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  onChange={(e) => updateThemeSettings && updateThemeSettings({ accentColor: e.target.value })}
                  value={settings.theme?.accentColor || '#000000'}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resume Page Container with Zoom Transform */}
      <div
        className="rounded-2xl transition-transform duration-200 ease-out origin-top mb-10"
        style={{ transform: `scale(${zoomLevel / 100})` }}
      >
        <div
          className="bg-white shadow-lg mx-auto transition-all duration-300 ease-in-out relative"
          style={{
            width: layout.format === 'A4' ? '210mm' : '8.5in',
            minHeight: layout.format === 'A4' ? '297mm' : '11in',
            ...containerStyle
          }}
        >
          {/* Page Break Indicator - positioned at page boundary */}
          <div
            className="absolute left-0 right-0 border-b-2 border-dashed border-slate-300 print:hidden pointer-events-none flex items-center justify-center z-10"
            style={{
              top: layout.format === 'A4' ? 'calc(297mm - 0.5in)' : 'calc(11in - 0.5in)',
            }}
          >
            <div className="bg-white border border-slate-200 px-3 py-1 rounded-full text-xs text-slate-500 flex items-center gap-1.5 shadow-sm">
              <span>✂️</span> Page Break
            </div>
          </div>
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
                {renderWithHighlights(`${profile.contact.firstName}${profile.contact.middleName ? ` ${profile.contact.middleName}` : ''} ${profile.contact.lastName}`, 'contact', undefined, 'name')}
              </h1>

              <div className={`flex flex-wrap gap-4 text-sm text-slate-600 mt-2 ${layout.headerAlignment === 'center' ? 'justify-center' :
                layout.headerAlignment === 'right' ? 'justify-end' : 'justify-start'
                }`} style={bodyStyle}>
                {profile.contact.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3" style={{ color: accentColor }} />
                    <span>{renderWithHighlights(profile.contact.email, 'contact', undefined, 'email')}</span>
                  </div>
                )}
                {profile.contact.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3" style={{ color: accentColor }} />
                    <span>{renderWithHighlights(profile.contact.phone, 'contact', undefined, 'phone')}</span>
                  </div>
                )}
                {profile.contact.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" style={{ color: accentColor }} />
                    <span>{renderWithHighlights(profile.contact.location, 'contact', undefined, 'location')}</span>
                  </div>
                )}
                {profile.contact.linkedin && (
                  <div className="flex items-center gap-1">
                    <Linkedin className="w-3 h-3" style={{ color: accentColor }} />
                    <a href={profile.contact.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600">
                      {profile.contact.linkedin.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                    </a>
                  </div>
                )}
                {profile.contact.website && (
                  <div className="flex items-center gap-1">
                    <Globe className="w-3 h-3" style={{ color: accentColor }} />
                    <a href={profile.contact.website} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600">
                      {profile.contact.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dynamic Sections */}
          {layout.sectionOrder.map(key => renderSection(key))}
        </div>
      </div>
    </div>
  );
}
