'use client';

import { useState } from 'react';
import { ResumeProfile } from '@/lib/resume-schema';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Download, Share, Settings, GripVertical, Star, Target, Zap } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SectionVisibility {
  [key: string]: boolean;
}

interface FullPageResumePreviewProps {
  profile: ResumeProfile;
  sectionVisibility: SectionVisibility;
  onBack: () => void;
  onEditSection?: (sectionKey: string) => void;
}

// Sortable Section Component
function SortableSection({ id, children }: { id: string; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div
        {...attributes}
        {...listeners}
        className="absolute left-0 top-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10"
      >
        <GripVertical className="w-4 h-4 text-slate-400" />
      </div>
      <div className="ml-6">
        {children}
      </div>
    </div>
  );
}

export function FullPageResumePreview({ profile, sectionVisibility, onBack, onEditSection }: FullPageResumePreviewProps) {
  const [showAdjustments, setShowAdjustments] = useState(false);
  const [fontSize, setFontSize] = useState([16]);
  const [fontFamily, setFontFamily] = useState('Inter');
  const [lineHeight, setLineHeight] = useState([1.6]);
  const [sectionOrder, setSectionOrder] = useState([
    'contact', 'summary', 'experience', 'education', 'skills', 'projects'
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleEditSection = (sectionKey: string) => {
    if (onEditSection) {
      onEditSection(sectionKey);
      onBack(); // Go back to editor
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setSectionOrder((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Calculate resume score
  const calculateResumeScore = () => {
    let score = 0;
    let maxScore = 100;
    
    // Contact info (20 points)
    if (profile.contact.firstName && profile.contact.lastName) score += 5;
    if (profile.contact.email) score += 5;
    if (profile.contact.phone) score += 5;
    if (profile.contact.linkedin || profile.contact.github) score += 5;
    
    // Summary (15 points)
    if (profile.summary?.content && profile.summary.content.length > 50) score += 15;
    
    // Experience (25 points)
    if (profile.experience.length > 0) score += 10;
    if (profile.experience.some(exp => exp.achievements.length > 0)) score += 15;
    
    // Education (15 points)
    if (profile.education.length > 0) score += 15;
    
    // Skills (15 points)
    const totalSkills = Object.values(profile.skills).flat().length;
    if (totalSkills > 0) score += Math.min(15, totalSkills * 2);
    
    // Projects (10 points)
    if (profile.projects.length > 0) score += 10;
    
    return Math.min(score, maxScore);
  };

  const resumeScore = calculateResumeScore();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Enhanced Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button onClick={onBack} variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Editor
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Resume Preview</h1>
                <p className="text-sm text-slate-600">Drag sections to reorder • Click to edit</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                <Settings className="w-4 h-4 mr-2" />
                Auto-adjust
              </Button>
              <Button 
                onClick={() => setShowAdjustments(!showAdjustments)}
                variant="outline" 
                size="sm" 
                className={`border-slate-300 text-slate-700 hover:bg-slate-50 ${showAdjustments ? 'bg-slate-100' : ''}`}
              >
                <Settings className="w-4 h-4 mr-2" />
                Adjustments
              </Button>
              <Button variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                Template
              </Button>
              <Button variant="outline" size="sm" className="border-green-600 text-green-600 hover:bg-green-50">
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex max-w-7xl mx-auto">
        {/* Adjustment Panel */}
        {showAdjustments && (
          <div className="w-80 bg-white border-r border-slate-200 p-6 h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Adjustments</h3>
            
            <div className="space-y-6">
              {/* Font Family */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Font Family</label>
                <Select value={fontFamily} onValueChange={setFontFamily}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Arial">Arial</SelectItem>
                    <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                    <SelectItem value="Helvetica">Helvetica</SelectItem>
                    <SelectItem value="Georgia">Georgia</SelectItem>
                    <SelectItem value="Roboto">Roboto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Font Size */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Font Size: {fontSize[0]}px
                </label>
                <Slider
                  value={fontSize}
                  onValueChange={setFontSize}
                  max={24}
                  min={12}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Line Height */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Line Height: {lineHeight[0]}
                </label>
                <Slider
                  value={lineHeight}
                  onValueChange={setLineHeight}
                  max={2.5}
                  min={1.2}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Reset Button */}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setFontSize([16]);
                  setFontFamily('Inter');
                  setLineHeight([1.6]);
                }}
              >
                Reset to Default
              </Button>
            </div>
          </div>
        )}

        {/* Preview Content */}
        <div className="flex-1 p-8">
          <div className="flex gap-6 max-w-6xl mx-auto">
            {/* Resume Preview */}
            <div 
              className="bg-white shadow-lg rounded-lg p-12 flex-1"
              style={{
                fontFamily: fontFamily,
                fontSize: `${fontSize[0]}px`,
                lineHeight: lineHeight[0],
              }}
            >
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
                {/* Contact Section - Always first, not draggable */}
                <div 
                  className="text-center mb-8 p-4 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors group"
                  onClick={() => handleEditSection('contact')}
                >
                  <h1 className="text-4xl font-bold text-slate-900 mb-3 group-hover:text-blue-700 transition-colors">
                    {profile.contact.firstName || 'Your Name'} {profile.contact.lastName}
                  </h1>
                    <div className="text-slate-600 space-y-1">
                      <p className="text-lg">{profile.contact.email || 'your.email@example.com'}</p>
                      {profile.contact.phone && <p>{profile.contact.phone}</p>}
                      {profile.contact.location && <p>{profile.contact.location}</p>}
                      <div className="flex justify-center space-x-6 mt-3">
                        {profile.contact.linkedin && (
                          <a href={profile.contact.linkedin} className="text-blue-600 hover:underline" onClick={(e) => e.stopPropagation()}>
                            LinkedIn
                          </a>
                        )}
                        {profile.contact.github && (
                          <a href={profile.contact.github} className="text-blue-600 hover:underline" onClick={(e) => e.stopPropagation()}>
                            GitHub
                          </a>
                        )}
                        {profile.contact.website && (
                          <a href={profile.contact.website} className="text-blue-600 hover:underline" onClick={(e) => e.stopPropagation()}>
                            Website
                          </a>
                        )}
                        {profile.contact.portfolio && (
                          <a href={profile.contact.portfolio} className="text-blue-600 hover:underline" onClick={(e) => e.stopPropagation()}>
                            Portfolio
                          </a>
                        )}
                      </div>
                    </div>
                    {onEditSection && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-2">
                        <p className="text-sm text-blue-600 font-medium">Click to edit contact information</p>
                      </div>
                    )}
                  </div>

                {/* Draggable Sections */}
                {sectionOrder.filter(sectionKey => sectionKey !== 'contact' && sectionVisibility[sectionKey]).map((sectionKey) => (
                  <SortableSection key={sectionKey} id={sectionKey}>
                    {sectionKey === 'summary' && (
                      <div 
                        className="mb-8 p-4 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors group"
                        onClick={() => handleEditSection('summary')}
                      >
                        <h2 className="text-2xl font-semibold text-slate-900 mb-4 border-b-2 border-slate-200 pb-2 group-hover:text-blue-700 transition-colors">
                          Professional Summary
                        </h2>
                        {profile.summary?.content ? (
                          <p className="text-slate-700 leading-relaxed text-lg">{profile.summary.content}</p>
                        ) : (
                          <p className="text-slate-400 italic text-lg">Click to add your professional summary</p>
                        )}
                        {onEditSection && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-2">
                            <p className="text-sm text-blue-600 font-medium">Click to edit summary</p>
                          </div>
                        )}
                      </div>
                    )}

                    {sectionKey === 'experience' && (
                      <div 
                        className="mb-8 p-4 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors group"
                        onClick={() => handleEditSection('experience')}
                      >
                        <h2 className="text-2xl font-semibold text-slate-900 mb-4 border-b-2 border-slate-200 pb-2 group-hover:text-blue-700 transition-colors">
                          Professional Experience
                        </h2>
                        {profile.experience.length > 0 ? (
                          <div className="space-y-6">
                            {profile.experience.map((exp) => (
                              <div key={exp.id}>
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <h3 className="text-xl font-semibold text-slate-900">{exp.position}</h3>
                                    <p className="text-lg text-slate-700 font-medium">{exp.company}</p>
                                  </div>
                                  <div className="text-right text-slate-600">
                                    <p className="font-medium">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</p>
                                    {exp.location && <p>{exp.location}</p>}
                                  </div>
                                </div>
                                {exp.description && (
                                  <p className="text-slate-700 mb-3 leading-relaxed">{exp.description}</p>
                                )}
                                {exp.achievements.length > 0 && exp.achievements[0] && (
                                  <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                                    {exp.achievements.filter(Boolean).map((achievement, index) => (
                                      <li key={index} className="leading-relaxed">{achievement}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-400 italic text-lg">Click to add your work experience</p>
                        )}
                        {onEditSection && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-2">
                            <p className="text-sm text-blue-600 font-medium">Click to edit experience</p>
                          </div>
                        )}
                      </div>
                    )}

                    {sectionKey === 'education' && (
                      <div 
                        className="mb-8 p-4 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors group"
                        onClick={() => handleEditSection('education')}
                      >
                        <h2 className="text-2xl font-semibold text-slate-900 mb-4 border-b-2 border-slate-200 pb-2 group-hover:text-blue-700 transition-colors">
                          Education
                        </h2>
                        {profile.education.length > 0 ? (
                          <div className="space-y-4">
                            {profile.education.map((edu) => (
                              <div key={edu.id} className="flex justify-between items-start">
                                <div>
                                  <h3 className="text-xl font-semibold text-slate-900">
                                    {edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}
                                  </h3>
                                  <p className="text-lg text-slate-700 font-medium">{edu.institution}</p>
                                  {edu.gpa && <p className="text-slate-600">GPA: {edu.gpa}</p>}
                                  {edu.honors && <p className="text-slate-600 italic">{edu.honors}</p>}
                                </div>
                                <div className="text-right text-slate-600">
                                  {edu.endDate && <p className="font-medium">{edu.endDate}</p>}
                                  {edu.location && <p>{edu.location}</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-400 italic text-lg">Click to add your education</p>
                        )}
                        {onEditSection && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-2">
                            <p className="text-sm text-blue-600 font-medium">Click to edit education</p>
                          </div>
                        )}
                      </div>
                    )}

                    {sectionKey === 'skills' && (
                      <div 
                        className="mb-8 p-4 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors group"
                        onClick={() => handleEditSection('skills')}
                      >
                        <h2 className="text-2xl font-semibold text-slate-900 mb-4 border-b-2 border-slate-200 pb-2 group-hover:text-blue-700 transition-colors">
                          Skills
                        </h2>
                        {Object.values(profile.skills).some(skillArray => skillArray.length > 0) ? (
                          <div className="space-y-4">
                            {Object.entries(profile.skills).map(([category, skills]) => {
                              if (skills.length === 0) return null;
                              return (
                                <div key={category}>
                                  <h4 className="font-semibold text-slate-800 mb-2 text-lg capitalize">
                                    {category === 'technical' ? 'Technical Skills' : 
                                     category === 'soft' ? 'Soft Skills' :
                                     category.charAt(0).toUpperCase() + category.slice(1)}:
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {skills.map((skill: string, index: number) => (
                                      <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                                        {skill}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-slate-400 italic text-lg">Click to add your skills</p>
                        )}
                        {onEditSection && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-2">
                            <p className="text-sm text-blue-600 font-medium">Click to edit skills</p>
                          </div>
                        )}
                      </div>
                    )}

                    {sectionKey === 'projects' && (
                      <div 
                        className="mb-8 p-4 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors group"
                        onClick={() => handleEditSection('projects')}
                      >
                        <h2 className="text-2xl font-semibold text-slate-900 mb-4 border-b-2 border-slate-200 pb-2 group-hover:text-blue-700 transition-colors">
                          Projects
                        </h2>
                        {profile.projects.length > 0 ? (
                          <div className="space-y-6">
                            {profile.projects.map((project) => (
                              <div key={project.id}>
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <h3 className="text-xl font-semibold text-slate-900">{project.name}</h3>
                                    <p className="text-lg text-slate-700 font-medium">{project.role}</p>
                                  </div>
                                  <div className="text-right text-slate-600">
                                    <p className="font-medium">{project.startDate} - {project.endDate || 'Present'}</p>
                                  </div>
                                </div>
                                {project.description && (
                                  <p className="text-slate-700 mb-3 leading-relaxed">{project.description}</p>
                                )}
                                {project.technologies.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {project.technologies.map((tech, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {tech}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-400 italic text-lg">Click to add your projects</p>
                        )}
                        {onEditSection && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-2">
                            <p className="text-sm text-blue-600 font-medium">Click to edit projects</p>
                          </div>
                        )}
                      </div>
                    )}
                  </SortableSection>
                ))}
              </SortableContext>
            </DndContext>
            </div>

            {/* Resume Score Sidebar */}
            <div className="w-80 space-y-4">
              {/* Score Card */}
              <Card className="p-6">
                <CardContent className="p-0">
                  <div className="text-center mb-4">
                    <div className="flex items-center justify-center mb-2">
                      {resumeScore >= 80 ? (
                        <Star className="w-8 h-8 text-green-600" />
                      ) : resumeScore >= 60 ? (
                        <Target className="w-8 h-8 text-yellow-600" />
                      ) : (
                        <Zap className="w-8 h-8 text-red-600" />
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">Resume Score</h3>
                    <Badge className={`${
                      resumeScore >= 80 ? 'bg-green-600' : 
                      resumeScore >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                    } text-white font-bold text-lg px-4 py-2`}>
                      {resumeScore}/100
                    </Badge>
                  </div>
                  
                  {/* Score Breakdown */}
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Contact Info</span>
                      <span className={`font-medium ${
                        (profile.contact.firstName && profile.contact.lastName && profile.contact.email && profile.contact.phone) ? 'text-green-600' : 'text-slate-400'
                      }`}>
                        {(profile.contact.firstName && profile.contact.lastName ? 5 : 0) + 
                         (profile.contact.email ? 5 : 0) + 
                         (profile.contact.phone ? 5 : 0) + 
                         ((profile.contact.linkedin || profile.contact.github) ? 5 : 0)}/20
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Summary</span>
                      <span className={`font-medium ${
                        (profile.summary?.content && profile.summary.content.length > 50) ? 'text-green-600' : 'text-slate-400'
                      }`}>
                        {(profile.summary?.content && profile.summary.content.length > 50) ? 15 : 0}/15
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Experience</span>
                      <span className={`font-medium ${
                        profile.experience.length > 0 ? 'text-green-600' : 'text-slate-400'
                      }`}>
                        {(profile.experience.length > 0 ? 10 : 0) + 
                         (profile.experience.some(exp => exp.achievements.length > 0) ? 15 : 0)}/25
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Education</span>
                      <span className={`font-medium ${
                        profile.education.length > 0 ? 'text-green-600' : 'text-slate-400'
                      }`}>
                        {profile.education.length > 0 ? 15 : 0}/15
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Skills</span>
                      <span className={`font-medium ${
                        Object.values(profile.skills).flat().length > 0 ? 'text-green-600' : 'text-slate-400'
                      }`}>
                        {Math.min(15, Object.values(profile.skills).flat().length * 2)}/15
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Projects</span>
                      <span className={`font-medium ${
                        profile.projects.length > 0 ? 'text-green-600' : 'text-slate-400'
                      }`}>
                        {profile.projects.length > 0 ? 10 : 0}/10
                      </span>
                    </div>
                  </div>

                  {/* Score Status */}
                  <div className="mt-4 p-3 rounded-lg bg-slate-50">
                    <p className="text-sm text-slate-700 font-medium">
                      {resumeScore >= 80 ? '🎉 Excellent! Your resume is well-optimized.' :
                       resumeScore >= 60 ? '👍 Good progress! Add more details to improve.' :
                       '🚀 Keep building! Add more sections and content.'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Tips */}
              <Card className="p-4">
                <CardContent className="p-0">
                  <h4 className="font-semibold text-slate-900 mb-3">Quick Tips</h4>
                  <div className="space-y-2 text-sm text-slate-600">
                    {resumeScore < 80 && (
                      <>
                        {!profile.summary?.content && (
                          <p>• Add a professional summary</p>
                        )}
                        {profile.experience.length === 0 && (
                          <p>• Include work experience</p>
                        )}
                        {!profile.experience.some(exp => exp.achievements.length > 0) && (
                          <p>• Add achievements to experience</p>
                        )}
                        {Object.values(profile.skills).flat().length < 5 && (
                          <p>• List more relevant skills</p>
                        )}
                        {profile.projects.length === 0 && (
                          <p>• Showcase your projects</p>
                        )}
                      </>
                    )}
                    {resumeScore >= 80 && (
                      <p>• Your resume looks great! Consider customizing the design.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
