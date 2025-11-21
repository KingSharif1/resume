'use client';

import { VolunteerExperience } from '@/lib/resume-schema';

interface VolunteerFormProps {
  volunteer: VolunteerExperience[];
  onChange: (volunteer: VolunteerExperience[]) => void;
}

export function VolunteerForm({ volunteer, onChange }: VolunteerFormProps) {
  return <div>Volunteer form placeholder</div>;
}
