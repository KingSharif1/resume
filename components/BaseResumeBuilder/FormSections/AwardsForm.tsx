'use client';

import { Award } from '@/lib/resume-schema';

interface AwardsFormProps {
  awards: Award[];
  onChange: (awards: Award[]) => void;
}

export function AwardsForm({ awards, onChange }: AwardsFormProps) {
  return <div>Awards form placeholder</div>;
}
