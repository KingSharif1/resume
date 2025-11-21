'use client';

import { SectionType, SectionConfig } from '@/lib/resume-schema';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  User, FileText, Briefcase, GraduationCap, Folder, Code, 
  Award, Heart, Trophy, Globe, CheckCircle, MessageCircle, Users, Coffee
} from 'lucide-react';

interface TabNavigationProps {
  sections: SectionConfig[];
  activeSection: SectionType;
  onSectionChange: (section: SectionType) => void;
  getSectionStatus: (section: SectionType) => boolean;
}

// Icon mapping
const iconMap = {
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Folder,
  Code,
  Award,
  Heart,
  Trophy,
  Globe,
  MessageCircle,
  Users,
  Coffee
};

export function TabNavigation({ 
  sections, 
  activeSection, 
  onSectionChange, 
  getSectionStatus 
}: TabNavigationProps) {
  
  const getIcon = (iconName: string) => {
    return iconMap[iconName as keyof typeof iconMap] || FileText;
  };

  return (
    <div className="flex overflow-x-auto scrollbar-hide">
      <div className="flex space-x-1 min-w-max px-1 py-2">
        {sections.map((section) => {
          const Icon = getIcon(section.icon);
          const isActive = activeSection === section.key;
          const isCompleted = getSectionStatus(section.key);
          
          return (
            <Button
              key={section.key}
              variant={isActive ? "default" : "ghost"}
              size="sm"
              onClick={() => onSectionChange(section.key)}
              className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-200 min-w-max",
                isActive && "bg-blue-600 text-white shadow-sm",
                !isActive && isCompleted && "bg-green-50 text-green-700 border border-green-200",
                !isActive && !isCompleted && "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{section.label}</span>
              {isCompleted && !isActive && (
                <CheckCircle className="w-3 h-3 text-green-600" />
              )}
              {section.required && !isCompleted && (
                <Badge variant="destructive" className="text-xs px-1 py-0 h-4">
                  !
                </Badge>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
