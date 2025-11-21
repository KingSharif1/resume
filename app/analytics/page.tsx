'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Eye, 
  Download, 
  Target, 
  Award,
  Users,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

interface ResumeAnalytics {
  totalViews: number;
  totalDownloads: number;
  averageScore: number;
  topKeywords: string[];
  industryMatch: number;
  atsCompatibility: number;
  recentActivity: ActivityItem[];
  scoreBreakdown: ScoreBreakdown;
  recommendations: Recommendation[];
}

interface ActivityItem {
  id: string;
  type: 'view' | 'download' | 'update' | 'tailor';
  description: string;
  timestamp: string;
  details?: string;
}

interface ScoreBreakdown {
  contact: number;
  summary: number;
  experience: number;
  education: number;
  skills: number;
  formatting: number;
}

interface Recommendation {
  id: string;
  type: 'improvement' | 'warning' | 'success';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
}

const mockAnalytics: ResumeAnalytics = {
  totalViews: 1247,
  totalDownloads: 89,
  averageScore: 87,
  topKeywords: ['React', 'JavaScript', 'Node.js', 'TypeScript', 'AWS'],
  industryMatch: 92,
  atsCompatibility: 95,
  recentActivity: [
    {
      id: '1',
      type: 'tailor',
      description: 'Resume tailored for Senior Frontend Developer at TechCorp',
      timestamp: '2 hours ago',
      details: 'Improved match score from 78% to 92%'
    },
    {
      id: '2',
      type: 'download',
      description: 'Resume downloaded as PDF',
      timestamp: '1 day ago'
    },
    {
      id: '3',
      type: 'update',
      description: 'Added new project: E-commerce Platform',
      timestamp: '3 days ago',
      details: 'Skills section updated with Next.js and Stripe'
    },
    {
      id: '4',
      type: 'view',
      description: 'Resume viewed by potential employer',
      timestamp: '1 week ago',
      details: 'From LinkedIn profile link'
    }
  ],
  scoreBreakdown: {
    contact: 100,
    summary: 85,
    experience: 90,
    education: 80,
    skills: 95,
    formatting: 88
  },
  recommendations: [
    {
      id: '1',
      type: 'improvement',
      title: 'Enhance Summary Section',
      description: 'Your professional summary could be more impactful. Consider adding quantifiable achievements.',
      impact: 'high'
    },
    {
      id: '2',
      type: 'success',
      title: 'Excellent Skills Section',
      description: 'Your skills are well-organized and relevant to your target roles.',
      impact: 'medium'
    },
    {
      id: '3',
      type: 'warning',
      title: 'Education Section Incomplete',
      description: 'Consider adding graduation dates and relevant coursework.',
      impact: 'low'
    }
  ]
};

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [analytics] = useState<ResumeAnalytics>(mockAnalytics);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Sign In Required</h2>
          <p className="text-slate-600">Please sign in to view your resume analytics</p>
        </div>
      </div>
    );
  }

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'view': return <Eye className="w-4 h-4" />;
      case 'download': return <Download className="w-4 h-4" />;
      case 'update': return <Activity className="w-4 h-4" />;
      case 'tailor': return <Target className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getRecommendationIcon = (type: Recommendation['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'improvement': return <TrendingUp className="w-5 h-5 text-blue-600" />;
      default: return <Info className="w-5 h-5 text-slate-600" />;
    }
  };

  const getImpactColor = (impact: Recommendation['impact']) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Resume Analytics</h1>
            <p className="text-slate-600">Track your resume performance and get insights</p>
          </div>
          <div className="flex gap-2">
            {['7d', '30d', '90d', '1y'].map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
              >
                {period}
              </Button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Downloads</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalDownloads}</div>
              <p className="text-xs text-muted-foreground">+5% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.averageScore}%</div>
              <p className="text-xs text-muted-foreground">+3% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ATS Compatible</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.atsCompatibility}%</div>
              <p className="text-xs text-muted-foreground">Excellent rating</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Score Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Score Breakdown
              </CardTitle>
              <CardDescription>
                Detailed analysis of your resume sections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(analytics.scoreBreakdown).map(([section, score]) => (
                <div key={section} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="capitalize font-medium">{section}</span>
                    <span className="text-sm text-slate-600">{score}%</span>
                  </div>
                  <Progress value={score} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Top Keywords */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Top Keywords
              </CardTitle>
              <CardDescription>
                Most frequently used skills and technologies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {analytics.topKeywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {keyword}
                  </Badge>
                ))}
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Industry Match</span>
                  <span className="text-sm text-slate-600">{analytics.industryMatch}%</span>
                </div>
                <Progress value={analytics.industryMatch} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest updates and interactions with your resume
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="p-1 bg-white rounded-full">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">
                        {activity.description}
                      </p>
                      {activity.details && (
                        <p className="text-xs text-slate-600 mt-1">
                          {activity.details}
                        </p>
                      )}
                      <p className="text-xs text-slate-500 mt-1">
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Recommendations
              </CardTitle>
              <CardDescription>
                AI-powered suggestions to improve your resume
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.recommendations.map((rec) => (
                  <div key={rec.id} className="p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      {getRecommendationIcon(rec.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-slate-900">{rec.title}</h4>
                          <Badge className={getImpactColor(rec.impact)} variant="secondary">
                            {rec.impact} impact
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">{rec.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
