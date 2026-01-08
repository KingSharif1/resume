/**
 * Changelog System
 * Tracks all changes made to the resume for audit trail
 */

export interface ChangelogEntry {
  id: string;
  timestamp: Date;
  type: 'suggestion_applied' | 'manual_edit' | 'ai_chat' | 'scan';
  section: string;
  field?: string;
  itemId?: string;
  
  // What changed
  before: string;
  after: string;
  
  // Context
  suggestionType?: string;
  reason?: string;
  
  // User info (if available)
  userId?: string;
}

export interface ChangelogGroup {
  date: string; // YYYY-MM-DD
  entries: ChangelogEntry[];
}

/**
 * Generate a unique changelog entry ID
 */
export function generateChangelogId(): string {
  return `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new changelog entry
 */
export function createChangelogEntry(
  params: Omit<ChangelogEntry, 'id' | 'timestamp'>
): ChangelogEntry {
  return {
    ...params,
    id: generateChangelogId(),
    timestamp: new Date(),
  };
}

/**
 * Group changelog entries by date
 */
export function groupChangelogByDate(entries: ChangelogEntry[]): ChangelogGroup[] {
  const groups = new Map<string, ChangelogEntry[]>();
  
  entries.forEach(entry => {
    const date = entry.timestamp.toISOString().split('T')[0];
    if (!groups.has(date)) {
      groups.set(date, []);
    }
    groups.get(date)!.push(entry);
  });
  
  return Array.from(groups.entries())
    .map(([date, entries]) => ({ date, entries }))
    .sort((a, b) => b.date.localeCompare(a.date)); // Most recent first
}

/**
 * Format timestamp for display
 */
export function formatChangelogTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

/**
 * Format date for display
 */
export function formatChangelogDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const dateStr = date.toISOString().split('T')[0];
  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  if (dateStr === todayStr) return 'Today';
  if (dateStr === yesterdayStr) return 'Yesterday';
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}
