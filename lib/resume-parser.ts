export interface ParsedResumeSection {
  title: string;
  content: string;
}

interface SectionPattern {
  keywords: string[];
  normalizedName: string;
  priority: number;
}

const SECTION_PATTERNS: SectionPattern[] = [
  {
    keywords: ['contact', 'contact information', 'personal information', 'personal details'],
    normalizedName: 'Contact Information',
    priority: 1
  },
  {
    keywords: ['summary', 'professional summary', 'executive summary', 'profile', 'about', 'about me', 'objective', 'career objective', 'professional objective'],
    normalizedName: 'Professional Summary',
    priority: 2
  },
  {
    keywords: ['experience', 'work experience', 'professional experience', 'employment', 'employment history', 'work history', 'career history'],
    normalizedName: 'Experience',
    priority: 3
  },
  {
    keywords: ['education', 'academic background', 'educational background', 'academic qualifications', 'qualifications'],
    normalizedName: 'Education',
    priority: 4
  },
  {
    keywords: ['skills', 'technical skills', 'core competencies', 'competencies', 'expertise', 'technical expertise', 'key skills', 'professional skills'],
    normalizedName: 'Skills',
    priority: 5
  },
  {
    keywords: ['projects', 'personal projects', 'key projects', 'notable projects', 'project experience'],
    normalizedName: 'Projects',
    priority: 6
  },
  {
    keywords: ['certifications', 'certificates', 'professional certifications', 'licenses', 'certifications & licenses'],
    normalizedName: 'Certifications',
    priority: 7
  },
  {
    keywords: ['awards', 'honors', 'achievements', 'honors & awards', 'recognition', 'accomplishments'],
    normalizedName: 'Awards & Honors',
    priority: 8
  },
  {
    keywords: ['publications', 'research', 'papers', 'research papers', 'published work'],
    normalizedName: 'Publications',
    priority: 9
  },
  {
    keywords: ['volunteer', 'volunteering', 'volunteer experience', 'community service', 'volunteer work'],
    normalizedName: 'Volunteer Experience',
    priority: 10
  },
  {
    keywords: ['languages', 'language skills', 'language proficiency'],
    normalizedName: 'Languages',
    priority: 11
  },
  {
    keywords: ['interests', 'hobbies', 'hobbies and interests', 'personal interests'],
    normalizedName: 'Interests',
    priority: 12
  },
  {
    keywords: ['references', 'professional references'],
    normalizedName: 'References',
    priority: 13
  },
  {
    keywords: ['activities', 'extracurricular', 'extracurricular activities', 'leadership', 'leadership experience'],
    normalizedName: 'Activities',
    priority: 14
  },
];

function normalizeText(text: string): string {
  return text.toLowerCase().trim().replace(/[:\-_]/g, '').replace(/\s+/g, ' ');
}

function detectSectionHeader(line: string): string | null {
  const normalized = normalizeText(line);

  if (normalized.length > 100) {
    return null;
  }

  for (const pattern of SECTION_PATTERNS) {
    for (const keyword of pattern.keywords) {
      const normalizedKeyword = normalizeText(keyword);

      if (normalized === normalizedKeyword) {
        return pattern.normalizedName;
      }

      if (normalized.startsWith(normalizedKeyword) && normalized.length <= normalizedKeyword.length + 3) {
        return pattern.normalizedName;
      }
    }
  }

  const allCaps = line === line.toUpperCase() && line.length > 2 && line.length < 50;
  const hasColon = line.endsWith(':');
  const wordCount = line.split(/\s+/).length;

  if ((allCaps || hasColon) && wordCount <= 5) {
    const possibleHeader = line.replace(/:/g, '').trim();
    if (possibleHeader.length >= 3) {
      return possibleHeader;
    }
  }

  return null;
}

function extractContactInfo(lines: string[]): string {
  const contactLines: string[] = [];
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const phonePattern = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const linkedInPattern = /linkedin\.com\/in\/[\w-]+/i;
  const githubPattern = /github\.com\/[\w-]+/i;

  for (let i = 0; i < Math.min(15, lines.length); i++) {
    const line = lines[i];
    if (emailPattern.test(line) || phonePattern.test(line) ||
        linkedInPattern.test(line) || githubPattern.test(line) ||
        line.includes('linkedin.com') || line.includes('github.com')) {
      contactLines.push(line);
    }
  }

  return contactLines.join('\n');
}

function isLikelyBulletPoint(line: string): boolean {
  const bulletPatterns = [
    /^[•●○■▪▫–—-]\s+/,
    /^\*\s+/,
    /^\d+\.\s+/,
    /^[a-z]\)\s+/i,
  ];

  return bulletPatterns.some(pattern => pattern.test(line));
}

function extractDateRange(text: string): { start?: string; end?: string } | null {
  const datePatterns = [
    /(\d{4})\s*[-–—to]+\s*(\d{4}|present|current)/i,
    /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{4}\s*[-–—to]+\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{4}/i,
    /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{4}\s*[-–—to]+\s*(present|current)/i,
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      return { start: match[1], end: match[2] };
    }
  }

  return null;
}

function groupBulletPoints(lines: string[]): string[] {
  const grouped: string[] = [];
  let currentGroup: string[] = [];

  for (const line of lines) {
    if (isLikelyBulletPoint(line)) {
      currentGroup.push(line);
    } else {
      if (currentGroup.length > 0) {
        grouped.push(currentGroup.join('\n'));
        currentGroup = [];
      }
      grouped.push(line);
    }
  }

  if (currentGroup.length > 0) {
    grouped.push(currentGroup.join('\n'));
  }

  return grouped;
}

export function parseResumeText(text: string): {
  summary: string;
  sections: ParsedResumeSection[]
} {
  const rawLines = text.split('\n');
  const lines = rawLines.map(line => line.trim()).filter(line => line.length > 0);

  if (lines.length === 0) {
    return {
      summary: '',
      sections: [{
        title: 'Resume Content',
        content: text
      }]
    };
  }

  const sections: ParsedResumeSection[] = [];
  let currentSection: { title: string; content: string[] } | null = null;
  let summary = '';
  let skipLines = 0;

  const contactInfo = extractContactInfo(lines);
  if (contactInfo) {
    sections.push({
      title: 'Contact Information',
      content: contactInfo
    });
  }

  for (let i = 0; i < lines.length; i++) {
    if (skipLines > 0) {
      skipLines--;
      continue;
    }

    const line = lines[i];
    const detectedHeader = detectSectionHeader(line);

    if (detectedHeader) {
      if (currentSection && currentSection.content.length > 0) {
        const groupedContent = groupBulletPoints(currentSection.content);
        sections.push({
          title: currentSection.title,
          content: groupedContent.join('\n').trim()
        });
      }

      currentSection = {
        title: detectedHeader,
        content: []
      };

      if (detectedHeader === 'Professional Summary' ||
          detectedHeader.includes('Objective')) {
        const summaryLines: string[] = [];
        for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
          if (detectSectionHeader(lines[j])) {
            break;
          }
          summaryLines.push(lines[j]);
        }
        summary = summaryLines.join(' ').substring(0, 400);
      }
    } else if (currentSection) {
      if (!contactInfo.includes(line)) {
        currentSection.content.push(line);
      }
    } else if (i < 5 && !summary && line.length > 20 && !contactInfo.includes(line)) {
      summary += (summary ? ' ' : '') + line;
    }
  }

  if (currentSection && currentSection.content.length > 0) {
    const groupedContent = groupBulletPoints(currentSection.content);
    sections.push({
      title: currentSection.title,
      content: groupedContent.join('\n').trim()
    });
  }

  const uniqueSections = sections.reduce((acc, section) => {
    const existing = acc.find(s => s.title === section.title);
    if (!existing) {
      acc.push(section);
    } else if (section.content.length > existing.content.length) {
      const index = acc.indexOf(existing);
      acc[index] = section;
    }
    return acc;
  }, [] as ParsedResumeSection[]);

  if (!summary && uniqueSections.length > 0) {
    const summarySection = uniqueSections.find(s =>
      s.title.toLowerCase().includes('summary') ||
      s.title.toLowerCase().includes('objective') ||
      s.title.toLowerCase().includes('profile')
    );
    if (summarySection) {
      summary = summarySection.content.substring(0, 400);
    }
  }

  if (!summary) {
    const firstNonContact = lines.slice(3, 8).join(' ');
    summary = firstNonContact.substring(0, 300);
  }

  return {
    summary: summary.trim(),
    sections: uniqueSections.length > 0 ? uniqueSections : [{
      title: 'Resume Content',
      content: text
    }]
  };
}
