'use client';

import { ContactInfo } from '@/lib/resume-schema';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

interface ContactFormProps {
  contact: ContactInfo;
  onChange: (contact: ContactInfo) => void;
}

export function ContactForm({ contact, onChange }: ContactFormProps) {
  const updateField = (field: keyof ContactInfo, value: string) => {
    onChange({
      ...contact,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={contact.firstName}
                onChange={(e) => updateField('firstName', e.target.value)}
                placeholder="John"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="middleName">Middle Name/Initial</Label>
              <Input
                id="middleName"
                value={contact.middleName || ''}
                onChange={(e) => updateField('middleName', e.target.value)}
                placeholder="A."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={contact.lastName}
                onChange={(e) => updateField('lastName', e.target.value)}
                placeholder="Doe"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Details */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={contact.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="john.doe@example.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={contact.phone || ''}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={contact.location || ''}
                onChange={(e) => updateField('location', e.target.value)}
                placeholder="New York, NY"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Online Presence */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="linkedin">LinkedIn Profile</Label>
              <Input
                id="linkedin"
                value={contact.linkedin || ''}
                onChange={(e) => updateField('linkedin', e.target.value)}
                placeholder="https://linkedin.com/in/johndoe"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="github">GitHub Profile</Label>
              <Input
                id="github"
                value={contact.github || ''}
                onChange={(e) => updateField('github', e.target.value)}
                placeholder="https://github.com/johndoe"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="website">Personal Website</Label>
              <Input
                id="website"
                value={contact.website || ''}
                onChange={(e) => updateField('website', e.target.value)}
                placeholder="https://johndoe.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="portfolio">Portfolio</Label>
              <Input
                id="portfolio"
                value={contact.portfolio || ''}
                onChange={(e) => updateField('portfolio', e.target.value)}
                placeholder="https://portfolio.johndoe.com"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
