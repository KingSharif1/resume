'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText, Sparkles, Download } from 'lucide-react';
import { ResumeForm } from '@/components/ResumeForm';
import { ResumeOutput } from '@/components/ResumeOutput';
import { AuthButton } from '@/components/AuthButton';
import { TailoredResume } from '@/types/resume';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [tailoredResume, setTailoredResume] = useState<TailoredResume | null>(null);
  const { user, loading } = useAuth();

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
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <button
              onClick={() => setShowForm(false)}
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent"
            >
              Resume Tailor
            </button>
            <AuthButton user={user} />
          </div>
        </nav>
        <ResumeForm onResumeGenerated={handleResumeGenerated} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Resume Tailor
          </div>
          <AuthButton user={user} />
        </div>
      </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center space-y-8 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              AI-Powered Resume Optimization
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Tailor Your Resume
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                to Any Job in Seconds
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Upload your resume, paste a job description, and let AI optimize it for ATS systems and recruiters.
              Get keyword-rich, tailored resumes instantly.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              {user ? (
                <Button
                  size="lg"
                  onClick={() => setShowForm(true)}
                  className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Get Started <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              ) : (
                <div className="text-center space-y-4">
                  <p className="text-slate-600">Sign in to start tailoring your resume</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-900">Upload Resume</h3>
              <p className="text-slate-600 leading-relaxed">
                Upload your base resume as PDF or paste the text directly. We'll parse and optimize it.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-900">AI Optimization</h3>
              <p className="text-slate-600 leading-relaxed">
                Our AI analyzes the job description and tailors your resume with relevant keywords and structure.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Download className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-900">Download & Apply</h3>
              <p className="text-slate-600 leading-relaxed">
                Edit, preview, and download your tailored resume as PDF or text. Ready to apply instantly.
              </p>
            </div>
          </div>

          <div className="mt-20 bg-gradient-to-r from-blue-50 to-slate-50 rounded-3xl p-8 md:p-12 border border-blue-100">
            <h2 className="text-3xl font-bold text-slate-900 mb-6 text-center">Example Input</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-slate-700 mb-3">Base Resume</h3>
                <div className="bg-white p-4 rounded-lg border border-slate-200 text-sm text-slate-600">
                  <p className="font-medium mb-2">John Doe</p>
                  <p className="mb-2">Software Engineer with 5 years experience...</p>
                  <p className="text-xs text-slate-500">Experience: Built web apps, worked with teams...</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-700 mb-3">Job Description</h3>
                <div className="bg-white p-4 rounded-lg border border-slate-200 text-sm text-slate-600">
                  <p className="font-medium mb-2">Senior Frontend Developer</p>
                  <p className="mb-2">Looking for React expert with TypeScript...</p>
                  <p className="text-xs text-slate-500">Requirements: React, Next.js, TypeScript, API integration...</p>
                </div>
              </div>
            </div>
          </div>
        </main>

      <footer className="border-t mt-24 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-600">
          <p>Resume Tailor - Optimize your resume with AI</p>
        </div>
      </footer>
    </div>
  );
}
