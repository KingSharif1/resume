'use client';

import { useState } from 'react';
import { Project, generateId } from '@/lib/resume-schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, ChevronDown, ChevronUp, X } from 'lucide-react';

interface ProjectsFormProps {
  projects: Project[];
  onChange: (projects: Project[]) => void;
}

export function ProjectsForm({ projects, onChange }: ProjectsFormProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const addProject = () => {
    const newProject: Project = {
      id: generateId(),
      name: '',
      description: '',
      role: '',
      startDate: '',
      endDate: '',
      technologies: [],
      url: '',
      github: '',
      achievements: ['']
    };

    const updated = [...projects, newProject];
    onChange(updated);
    
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      newSet.add(newProject.id);
      return newSet;
    });
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    const updated = projects.map(project => 
      project.id === id ? { ...project, ...updates } : project
    );
    onChange(updated);
  };

  const removeProject = (id: string) => {
    const updated = projects.filter(project => project.id !== id);
    onChange(updated);
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const addTechnology = (projectId: string, tech: string) => {
    if (!tech.trim()) return;
    const project = projects.find(p => p.id === projectId);
    if (project && !project.technologies.includes(tech.trim())) {
      updateProject(projectId, { 
        technologies: [...project.technologies, tech.trim()] 
      });
    }
  };

  const removeTechnology = (projectId: string, index: number) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const newTechnologies = project.technologies.filter((_, i) => i !== index);
      updateProject(projectId, { technologies: newTechnologies });
    }
  };

  const updateAchievement = (projectId: string, index: number, value: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const newAchievements = [...project.achievements];
      newAchievements[index] = value;
      updateProject(projectId, { achievements: newAchievements });
    }
  };

  const addAchievement = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      updateProject(projectId, { 
        achievements: [...project.achievements, ''] 
      });
    }
  };

  const removeAchievement = (projectId: string, index: number) => {
    const project = projects.find(p => p.id === projectId);
    if (project && project.achievements.length > 1) {
      const newAchievements = project.achievements.filter((_, i) => i !== index);
      updateProject(projectId, { achievements: newAchievements });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Projects</h3>
          <p className="text-sm text-slate-600">Add your personal and professional projects</p>
        </div>
        <Button onClick={addProject} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-slate-500 mb-4">No projects added yet</p>
          <Button onClick={addProject} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Project
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => {
            const isExpanded = expandedItems.has(project.id);
            
            return (
              <Card key={project.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">
                        {project.name || 'New Project'}
                      </CardTitle>
                      <p className="text-sm text-slate-600">
                        {project.role && `${project.role} • `}
                        {project.startDate && project.endDate && `${project.startDate} - ${project.endDate}`}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(project.id)}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProject(project.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`name-${project.id}`}>Project Name *</Label>
                        <Input
                          id={`name-${project.id}`}
                          value={project.name}
                          onChange={(e) => updateProject(project.id, { name: e.target.value })}
                          placeholder="E-commerce Website"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`role-${project.id}`}>Your Role</Label>
                        <Input
                          id={`role-${project.id}`}
                          value={project.role || ''}
                          onChange={(e) => updateProject(project.id, { role: e.target.value })}
                          placeholder="Full Stack Developer"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`startDate-${project.id}`}>Start Date</Label>
                        <Input
                          id={`startDate-${project.id}`}
                          type="month"
                          value={project.startDate || ''}
                          onChange={(e) => updateProject(project.id, { startDate: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`endDate-${project.id}`}>End Date</Label>
                        <Input
                          id={`endDate-${project.id}`}
                          type="month"
                          value={project.endDate || ''}
                          onChange={(e) => updateProject(project.id, { endDate: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`description-${project.id}`}>Description *</Label>
                      <Textarea
                        id={`description-${project.id}`}
                        value={project.description}
                        onChange={(e) => updateProject(project.id, { description: e.target.value })}
                        placeholder="Describe what this project does and your contributions..."
                        className="mt-1 min-h-[80px]"
                      />
                    </div>

                    <div>
                      <Label>Technologies Used</Label>
                      <div className="mt-2 space-y-2">
                        {project.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {project.technologies.map((tech, index) => (
                              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                {tech}
                                <button
                                  onClick={() => removeTechnology(project.id, index)}
                                  className="ml-1 hover:text-red-600"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add technology (React, Node.js, etc.)"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const input = e.target as HTMLInputElement;
                                addTechnology(project.id, input.value);
                                input.value = '';
                              }
                            }}
                            className="text-sm"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const input = document.querySelector(`input[placeholder*="Add technology"]`) as HTMLInputElement;
                              if (input) {
                                addTechnology(project.id, input.value);
                                input.value = '';
                              }
                            }}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`url-${project.id}`}>Project URL</Label>
                        <Input
                          id={`url-${project.id}`}
                          value={project.url || ''}
                          onChange={(e) => updateProject(project.id, { url: e.target.value })}
                          placeholder="https://myproject.com"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`github-${project.id}`}>GitHub Repository</Label>
                        <Input
                          id={`github-${project.id}`}
                          value={project.github || ''}
                          onChange={(e) => updateProject(project.id, { github: e.target.value })}
                          placeholder="https://github.com/username/repo"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label>Key Achievements</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addAchievement(project.id)}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Achievement
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {project.achievements.map((achievement, index) => (
                          <div key={index} className="flex gap-2">
                            <Textarea
                              value={achievement}
                              onChange={(e) => updateAchievement(project.id, index, e.target.value)}
                              placeholder="• Achieved 99% uptime with automated deployment pipeline"
                              className="min-h-[60px]"
                            />
                            {project.achievements.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeAchievement(project.id, index)}
                                className="shrink-0 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
