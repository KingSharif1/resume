'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText, Sparkles, Download, Upload, Plus, Briefcase, CheckCircle2, Zap, Shield } from 'lucide-react';
import { ResumeForm } from '@/components/ResumeForm';
import { ResumeOutput } from '@/components/ResumeOutput';
import { AuthButton } from '@/components/AuthButton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { TailoredResume } from '@/types/resume';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [tailoredResume, setTailoredResume] = useState<TailoredResume | null>(null);
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleResumeGenerated = (resume: TailoredResume) => {
    setTailoredResume(resume);
  };

  const handleStartOver = () => {
    setTailoredResume(null);
    setShowForm(true);
  };

  const handleGetStarted = () => {
    if (!user) {
      return;
    }
    setShowForm(true);
  };

  if (tailoredResume && user) {
    return (
      <ResumeOutput
        resume={tailoredResume}
        onStartOver={handleStartOver}
        user={user}
      />
    );
  }

  if (showForm && user) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <button
              onClick={() => setShowForm(false)}
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent"
            >
              Resume Tailor
            </button>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <AuthButton user={user} />
            </div>
          </div>
        </nav>
        <ResumeForm onResumeGenerated={handleResumeGenerated} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-blue-500/30">
      {/* Navbar */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent dark:from-white dark:to-slate-400">
              Resume Tailor
            </span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <AuthButton user={user} />
          </div>
        </div>
      </nav>

      <main className="relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] -z-10 dark:bg-blue-500/20" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-500/5 rounded-full blur-[100px] -z-10 dark:bg-purple-500/10" />

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-medium animate-fade-in">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Resume Intelligence</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight text-foreground">
              Craft Your Career <br />
              <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 dark:from-blue-400 dark:via-blue-500 dark:to-purple-500 bg-clip-text text-transparent">
                Masterpiece
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Build professional, ATS-optimized resumes in minutes. Leverage AI to tailor your experience for every job application.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              {user ? (
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <Button
                    size="lg"
                    onClick={() => router.push('/dashboard')}
                    className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 transition-all duration-200"
                  >
                    <FileText className="mr-2 w-5 h-5" />
                    My Resumes
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => router.push('/builder')}
                    className="h-14 px-8 text-lg border-input bg-background hover:bg-accent hover:text-accent-foreground backdrop-blur-sm transition-all duration-200"
                  >
                    <Plus className="mr-2 w-5 h-5" />
                    Create New
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <p className="text-muted-foreground">Sign in to start building your future</p>
                  <AuthButton user={user} />
                </div>
              )}
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-32">
            <div className="group p-8 rounded-2xl bg-card border border-border hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Instant Parsing</h3>
              <p className="text-muted-foreground leading-relaxed">
                Upload your existing PDF or DOCX. Our advanced AI extracts every detail to build your profile instantly.
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-card border border-border hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">AI Tailoring</h3>
              <p className="text-muted-foreground leading-relaxed">
                Paste a job description and watch as AI optimizes your resume keywords to beat the ATS.
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-card border border-border hover:border-green-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/10">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">ATS Friendly</h3>
              <p className="text-muted-foreground leading-relaxed">
                Templates designed to be parsed perfectly by Applicant Tracking Systems. Never get filtered out again.
              </p>
            </div>
          </div>

          {/* Interactive Demo Section */}
          <div className="mt-32 rounded-3xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden">
            <div className="grid md:grid-cols-2 border-b border-border">
              <div className="p-8 md:p-12 border-r border-border">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Smart Editor</h3>
                <p className="text-muted-foreground mb-8">
                  Real-time editing with live preview. Drag-and-drop sections, customize layouts, and get instant feedback.
                </p>
                <div className="space-y-4">
                  {[
                    'Real-time PDF Preview',
                    'Drag & Drop Sections',
                    'Smart Spell Check',
                    'Auto-Save'
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-3 text-muted-foreground">
                      <CheckCircle2 className="w-5 h-5 text-blue-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative bg-slate-100 dark:bg-slate-900/50 p-8 md:p-12 flex items-center justify-center">
                <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] bg-[length:32px_32px]" />
                <div className="relative w-full max-w-sm bg-background rounded-lg shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-500 border border-border">
                  <div className="h-4 w-1/3 bg-muted rounded mb-4" />
                  <div className="h-3 w-full bg-muted/50 rounded mb-2" />
                  <div className="h-3 w-5/6 bg-muted/50 rounded mb-2" />
                  <div className="h-3 w-4/6 bg-muted/50 rounded mb-6" />

                  <div className="h-4 w-1/4 bg-muted rounded mb-3" />
                  <div className="space-y-2">
                    <div className="h-2 w-full bg-muted/50 rounded" />
                    <div className="h-2 w-full bg-muted/50 rounded" />
                    <div className="h-2 w-full bg-muted/50 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-muted-foreground text-sm">
            © 2024 Resume Tailor. All rights reserved.
          </div>
          <div className="flex gap-6 text-muted-foreground text-sm">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
