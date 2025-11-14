'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, FileText, Clock, Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

interface BaseResume {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [baseResumes, setBaseResumes] = useState<BaseResume[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadResumes();
    }
  }, [user]);

  const loadResumes = async () => {
    try {
      const { data, error } = await supabase
        .from('base_resumes')
        .select('id, title, created_at, updated_at')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setBaseResumes(data || []);
    } catch (error) {
      console.error('Error loading resumes:', error);
      toast.error('Failed to load resumes');
    } finally {
      setLoadingData(false);
    }
  };

  const deleteResume = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;

    try {
      const { error } = await supabase.from('base_resumes').delete().eq('id', id);
      if (error) throw error;
      toast.success('Resume deleted');
      loadResumes();
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast.error('Failed to delete resume');
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Resumes</h1>
            <p className="text-slate-600">Manage your base resumes</p>
          </div>
          <Button onClick={() => router.push('/resume/create')} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Resume
          </Button>
        </div>

        {baseResumes.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No resumes yet</h3>
            <p className="text-slate-600 mb-6">Create your first base resume to get started</p>
            <Button onClick={() => router.push('/resume/create')} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Resume
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {baseResumes.map((resume) => (
              <Card key={resume.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{resume.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-2">
                        <Clock className="w-3 h-3" />
                        {new Date(resume.updated_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => router.push(`/resume/create?id=${resume.id}`)}
                      variant="outline"
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => deleteResume(resume.id)}
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
