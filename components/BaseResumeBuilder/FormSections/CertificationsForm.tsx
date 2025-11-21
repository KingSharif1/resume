'use client';

import { Certification } from '@/lib/resume-schema';

interface CertificationsFormProps {
  certifications: Certification[];
  onChange: (certifications: Certification[]) => void;
}

export function CertificationsForm({ certifications, onChange }: CertificationsFormProps) {
  return <div>Certifications form placeholder</div>;
}
