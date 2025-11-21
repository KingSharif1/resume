'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  MapPin, 
  Clock, 
  DollarSign, 
  Building, 
  ExternalLink,
  Filter,
  Star,
  Briefcase,
  TrendingUp
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  salary: string;
  description: string;
  requirements: string[];
  posted: string;
  featured: boolean;
  matchScore?: number;
}

const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    type: 'Full-time',
    salary: '$120k - $160k',
    description: 'We are looking for a Senior Frontend Developer to join our team and help build the next generation of web applications.',
    requirements: ['React', 'TypeScript', 'Next.js', '5+ years experience'],
    posted: '2 days ago',
    featured: true,
    matchScore: 92
  },
  {
    id: '2',
    title: 'Full Stack Engineer',
    company: 'StartupXYZ',
    location: 'New York, NY',
    type: 'Full-time',
    salary: '$100k - $140k',
    description: 'Join our fast-growing startup and work on cutting-edge technology that impacts millions of users.',
    requirements: ['Node.js', 'React', 'PostgreSQL', '3+ years experience'],
    posted: '1 day ago',
    featured: false,
    matchScore: 85
  },
  {
    id: '3',
    title: 'Remote React Developer',
    company: 'DigitalAgency',
    location: 'Remote',
    type: 'Remote',
    salary: '$90k - $120k',
    description: 'Work remotely with a distributed team building amazing web experiences for our clients.',
    requirements: ['React', 'JavaScript', 'CSS', '2+ years experience'],
    posted: '3 days ago',
    featured: false,
    matchScore: 78
  },
  {
    id: '4',
    title: 'Software Engineer Intern',
    company: 'BigTech Inc',
    location: 'Seattle, WA',
    type: 'Part-time',
    salary: '$25/hour',
    description: 'Summer internship opportunity to work with experienced engineers on real-world projects.',
    requirements: ['JavaScript', 'Python', 'Git', 'CS Student'],
    posted: '1 week ago',
    featured: true,
    matchScore: 65
  }
];

export default function JobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [showFilters, setShowFilters] = useState(false);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'All' || job.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const getMatchScoreColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-600';
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 80) return 'bg-blue-100 text-blue-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Briefcase className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Sign In Required</h2>
          <p className="text-slate-600">Please sign in to view job opportunities</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Job Opportunities</h1>
          <p className="text-slate-600">Find your next opportunity with AI-powered job matching</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Search jobs, companies, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <Card className="p-4">
              <div className="flex gap-4 items-center">
                <span className="text-sm font-medium text-slate-700">Job Type:</span>
                <div className="flex gap-2">
                  {['All', 'Full-time', 'Part-time', 'Contract', 'Remote'].map((type) => (
                    <Button
                      key={type}
                      variant={selectedType === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedType(type)}
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{filteredJobs.length}</p>
                <p className="text-sm text-slate-600">Available Jobs</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {Math.round(filteredJobs.reduce((acc, job) => acc + (job.matchScore || 0), 0) / filteredJobs.length)}%
                </p>
                <p className="text-sm text-slate-600">Avg Match Score</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {filteredJobs.filter(job => job.featured).length}
                </p>
                <p className="text-sm text-slate-600">Featured Jobs</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MapPin className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {filteredJobs.filter(job => job.type === 'Remote').length}
                </p>
                <p className="text-sm text-slate-600">Remote Jobs</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Job Listings */}
        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <Card className="p-12 text-center">
              <Search className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
              <p className="text-slate-600">Try adjusting your search criteria</p>
            </Card>
          ) : (
            filteredJobs.map((job) => (
              <Card key={job.id} className={`hover:shadow-lg transition-shadow ${job.featured ? 'border-blue-200 bg-blue-50/30' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-xl">{job.title}</CardTitle>
                        {job.featured && (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        {job.matchScore && (
                          <Badge className={getMatchScoreColor(job.matchScore)}>
                            {job.matchScore}% match
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-slate-600 mb-2">
                        <div className="flex items-center gap-1">
                          <Building className="w-4 h-4" />
                          {job.company}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {job.salary}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {job.posted}
                        </div>
                      </div>

                      <Badge variant="outline" className="mb-3">
                        {job.type}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-slate-700 mb-4">{job.description}</p>
                  
                  <div className="mb-4">
                    <h4 className="font-medium text-slate-900 mb-2">Requirements:</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.requirements.map((req, index) => (
                        <Badge key={index} variant="secondary">
                          {req}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Job
                    </Button>
                    <Button variant="outline">
                      Tailor Resume
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
