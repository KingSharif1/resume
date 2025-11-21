'use client';

import { ResumeProfile } from '@/lib/resume-schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Download, Share } from 'lucide-react';

interface ResumePreviewProps {
  profile: ResumeProfile;
  onClose: () => void;
}

export function ResumePreview({ profile, onClose }: ResumePreviewProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Resume Preview</h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline" size="sm">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-80px)] bg-slate-50">
          <div className="bg-white p-8 shadow-sm rounded-lg max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                {profile.contact.firstName} {profile.contact.lastName}
              </h1>
              <div className="text-slate-600 space-y-1">
                <p>{profile.contact.email}</p>
                {profile.contact.phone && <p>{profile.contact.phone}</p>}
                {profile.contact.location && <p>{profile.contact.location}</p>}
                <div className="flex justify-center space-x-4 mt-2">
                  {profile.contact.linkedin && (
                    <a href={profile.contact.linkedin} className="text-blue-600 hover:underline">
                      LinkedIn
                    </a>
                  )}
                  {profile.contact.github && (
                    <a href={profile.contact.github} className="text-blue-600 hover:underline">
                      GitHub
                    </a>
                  )}
                  {profile.contact.website && (
                    <a href={profile.contact.website} className="text-blue-600 hover:underline">
                      Website
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Summary */}
            {profile.summary?.content && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-3 border-b border-slate-200 pb-1">
                  Professional Summary
                </h2>
                <p className="text-slate-700 leading-relaxed">{profile.summary.content}</p>
              </div>
            )}

            {/* Experience */}
            {profile.experience.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-4 border-b border-slate-200 pb-1">
                  Professional Experience
                </h2>
                <div className="space-y-6">
                  {profile.experience.map((exp) => (
                    <div key={exp.id}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-medium text-slate-900">{exp.position}</h3>
                          <p className="text-slate-700">{exp.company}</p>
                        </div>
                        <div className="text-right text-sm text-slate-600">
                          <p>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</p>
                          {exp.location && <p>{exp.location}</p>}
                        </div>
                      </div>
                      {exp.description && (
                        <p className="text-slate-700 mb-2">{exp.description}</p>
                      )}
                      {exp.achievements.length > 0 && exp.achievements[0] && (
                        <ul className="list-disc list-inside text-slate-700 space-y-1">
                          {exp.achievements.filter(Boolean).map((achievement, index) => (
                            <li key={index}>{achievement}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {profile.education.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-4 border-b border-slate-200 pb-1">
                  Education
                </h2>
                <div className="space-y-4">
                  {profile.education.map((edu) => (
                    <div key={edu.id} className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-slate-900">
                          {edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}
                        </h3>
                        <p className="text-slate-700">{edu.institution}</p>
                        {edu.gpa && <p className="text-slate-600">GPA: {edu.gpa}</p>}
                      </div>
                      <div className="text-right text-sm text-slate-600">
                        {edu.endDate && <p>{edu.endDate}</p>}
                        {edu.location && <p>{edu.location}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {Object.values(profile.skills).some(skillArray => skillArray.length > 0) && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-4 border-b border-slate-200 pb-1">
                  Skills
                </h2>
                <div className="space-y-3">
                  {Object.entries(profile.skills).map(([category, skills]) => {
                    if (skills.length === 0) return null;
                    return (
                      <div key={category}>
                        <h4 className="font-medium text-slate-800 capitalize mb-2">
                          {category === 'technical' ? 'Technical Skills' : 
                           category === 'soft' ? 'Soft Skills' :
                           category.charAt(0).toUpperCase() + category.slice(1)}:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {skills.map((skill, index) => (
                            <Badge key={index} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Projects */}
            {profile.projects.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-4 border-b border-slate-200 pb-1">
                  Projects
                </h2>
                <div className="space-y-6">
                  {profile.projects.map((project) => (
                    <div key={project.id}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-medium text-slate-900">{project.name}</h3>
                          {project.role && <p className="text-slate-700">{project.role}</p>}
                        </div>
                        <div className="text-right text-sm text-slate-600">
                          {project.startDate && project.endDate && (
                            <p>{project.startDate} - {project.endDate}</p>
                          )}
                        </div>
                      </div>
                      <p className="text-slate-700 mb-2">{project.description}</p>
                      {project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {project.technologies.map((tech, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {project.achievements.length > 0 && project.achievements[0] && (
                        <ul className="list-disc list-inside text-slate-700 space-y-1">
                          {project.achievements.filter(Boolean).map((achievement, index) => (
                            <li key={index}>{achievement}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
