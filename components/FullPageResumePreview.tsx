'use client';

import { useState } from 'react';
import { ResumeProfile } from '@/lib/resume-schema';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Download, Share, Settings, GripVertical } from 'lucide-react';
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
  onBack?: () => void;
  onEditSection?: (sectionKey: string) => void;
  isSplitView?: boolean;
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

export function FullPageResumePreview({ profile, sectionVisibility, onBack, onEditSection, isSplitView = false }: FullPageResumePreviewProps) {
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
      onBack?.(); // Go back to editor
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

  return (
    <div className={`min-h-screen bg-slate-50 ${isSplitView ? 'min-h-0' : ''}`}>
      {/* Enhanced Header - Hide in split view or adjust */}
      {!isSplitView && (
        <div className="bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {onBack && (
                  <Button onClick={onBack} variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Editor
                  </Button>
                )}
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
      )}

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
          </div>
        </div>
      </div>
    </div >
  );
}
