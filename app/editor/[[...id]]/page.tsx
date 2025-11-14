'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { BaseResume, ContactInfo, Experience, Education, Skills } from '@/types/resume';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { AuthButton } from '@/components/AuthButton';
import { Save, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ResumeEditor() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const resumeId = params?.id?.[0];

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [resume, setResume] = useState<BaseResume>({
    title: 'My Resume',
    contact_info: {
      name: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      portfolio: '',
    },
    summary: '',
    experience: [],
    education: [],
    skills: {},
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (resumeId && user) {
      loadResume();
    }
  }, [resumeId, user]);

  const loadResume = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('base_resumes')
        .select('*')
        .eq('id', resumeId)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setResume({
          ...data,
          experience: data.experience || [],
          education: data.education || [],
          skills: data.skills || {},
          certifications: data.certifications || [],
          projects: data.projects || [],
          custom_sections: data.custom_sections || [],
        });
      }
    } catch (error) {
      console.error('Error loading resume:', error);
      toast.error('Failed to load resume');
    } finally {
      setLoading(false);
    }
  };

  const saveResume = async () => {
    if (!user) {
      toast.error('Please sign in to save');
      return;
    }

    setSaving(true);
    try {
      const resumeData = {
        user_id: user.id,
        title: resume.title,
        contact_info: resume.contact_info,
        summary: resume.summary,
        experience: resume.experience,
        education: resume.education,
        skills: resume.skills,
        certifications: resume.certifications || [],
        projects: resume.projects || [],
        custom_sections: resume.custom_sections || [],
        updated_at: new Date().toISOString(),
      };

      if (resumeId) {
        const { error } = await supabase
          .from('base_resumes')
          .update(resumeData)
          .eq('id', resumeId);

        if (error) throw error;
        toast.success('Resume updated!');
      } else {
        const { data, error } = await supabase
          .from('base_resumes')
          .insert([resumeData])
          .select()
          .single();

        if (error) throw error;
        toast.success('Resume saved!');
        router.push(`/editor/${data.id}`);
      }
    } catch (error) {
      console.error('Error saving resume:', error);
      toast.error('Failed to save resume');
    } finally {
      setSaving(false);
    }
  };

  const addExperience = () => {
    setResume({
      ...resume,
      experience: [
        ...resume.experience,
        {
          company: '',
          position: '',
          location: '',
          startDate: '',
          endDate: '',
          description: '',
          highlights: [],
        },
      ],
    });
  };

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    const updated = [...resume.experience];
    updated[index] = { ...updated[index], [field]: value };
    setResume({ ...resume, experience: updated });
  };

  const removeExperience = (index: number) => {
    setResume({
      ...resume,
      experience: resume.experience.filter((_, i) => i !== index),
    });
  };

  const addEducation = () => {
    setResume({
      ...resume,
      education: [
        ...resume.education,
        {
          institution: '',
          degree: '',
          field: '',
          location: '',
          startDate: '',
          endDate: '',
        },
      ],
    });
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const updated = [...resume.education];
    updated[index] = { ...updated[index], [field]: value };
    setResume({ ...resume, education: updated });
  };

  const removeEducation = (index: number) => {
    setResume({
      ...resume,
      education: resume.education.filter((_, i) => i !== index),
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Resume Editor
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={saveResume} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <AuthButton user={user} />
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Label htmlFor="title">Resume Title</Label>
          <Input
            id="title"
            value={resume.title}
            onChange={(e) => setResume({ ...resume, title: e.target.value })}
            placeholder="e.g., Software Engineer Resume"
            className="text-lg font-semibold"
          />
        </div>

        <Tabs defaultValue="contact" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
          </TabsList>

          <TabsContent value="contact">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={resume.contact_info.name}
                    onChange={(e) =>
                      setResume({
                        ...resume,
                        contact_info: { ...resume.contact_info, name: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={resume.contact_info.email}
                    onChange={(e) =>
                      setResume({
                        ...resume,
                        contact_info: { ...resume.contact_info, email: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={resume.contact_info.phone}
                    onChange={(e) =>
                      setResume({
                        ...resume,
                        contact_info: { ...resume.contact_info, phone: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={resume.contact_info.location}
                    onChange={(e) =>
                      setResume({
                        ...resume,
                        contact_info: { ...resume.contact_info, location: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={resume.contact_info.linkedin || ''}
                    onChange={(e) =>
                      setResume({
                        ...resume,
                        contact_info: { ...resume.contact_info, linkedin: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="portfolio">Portfolio/Website</Label>
                  <Input
                    id="portfolio"
                    value={resume.contact_info.portfolio || ''}
                    onChange={(e) =>
                      setResume({
                        ...resume,
                        contact_info: { ...resume.contact_info, portfolio: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="summary">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Professional Summary</h2>
              <Textarea
                value={resume.summary}
                onChange={(e) => setResume({ ...resume, summary: e.target.value })}
                placeholder="Write a brief professional summary..."
                rows={6}
              />
            </Card>
          </TabsContent>

          <TabsContent value="experience">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Work Experience</h2>
                <Button onClick={addExperience} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Experience
                </Button>
              </div>

              {resume.experience.map((exp, index) => (
                <Card key={index} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold">Experience {index + 1}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExperience(index)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Company</Label>
                      <Input
                        value={exp.company}
                        onChange={(e) => updateExperience(index, 'company', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Position</Label>
                      <Input
                        value={exp.position}
                        onChange={(e) => updateExperience(index, 'position', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Start Date</Label>
                      <Input
                        value={exp.startDate}
                        onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                        placeholder="e.g., Jan 2020"
                      />
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <Input
                        value={exp.endDate}
                        onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                        placeholder="e.g., Present"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Description</Label>
                      <Textarea
                        value={exp.description}
                        onChange={(e) =>
                          updateExperience(index, 'description', e.target.value)
                        }
                        rows={4}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="education">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Education</h2>
                <Button onClick={addEducation} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Education
                </Button>
              </div>

              {resume.education.map((edu, index) => (
                <Card key={index} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold">Education {index + 1}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEducation(index)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Institution</Label>
                      <Input
                        value={edu.institution}
                        onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Degree</Label>
                      <Input
                        value={edu.degree}
                        onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Field of Study</Label>
                      <Input
                        value={edu.field}
                        onChange={(e) => updateEducation(index, 'field', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Location</Label>
                      <Input
                        value={edu.location || ''}
                        onChange={(e) => updateEducation(index, 'location', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Start Date</Label>
                      <Input
                        value={edu.startDate}
                        onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                        placeholder="e.g., Sep 2016"
                      />
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <Input
                        value={edu.endDate}
                        onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                        placeholder="e.g., May 2020"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex justify-end gap-4">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Cancel
          </Button>
          <Button onClick={saveResume} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Resume'}
          </Button>
        </div>
      </main>
    </div>
  );
}
