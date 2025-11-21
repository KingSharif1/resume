'use client';

import { Publication } from '@/lib/resume-schema';

interface PublicationsFormProps {
  publications: Publication[];
  onChange: (publications: Publication[]) => void;
}

export function PublicationsForm({ publications, onChange }: PublicationsFormProps) {
  return <div>Publications form placeholder</div>;
}
