'use client';

import { ContactInfo } from '@/lib/resume-schema';
import { Card, CardContent } from '@/components/ui/card';
import { UnifiedTextField } from '@/components/fields';

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
            <UnifiedTextField
              id="contact-firstName"
              section="contact"
              fieldKey="firstName"
              label="First Name"
              value={contact.firstName}
              onChange={(value) => updateField('firstName', value)}
              placeholder="John"
              required
            />
            <UnifiedTextField
              id="contact-middleName"
              section="contact"
              fieldKey="middleName"
              label="Middle Name/Initial"
              value={contact.middleName || ''}
              onChange={(value) => updateField('middleName', value)}
              placeholder="A."
            />
            <UnifiedTextField
              id="contact-lastName"
              section="contact"
              fieldKey="lastName"
              label="Last Name"
              value={contact.lastName}
              onChange={(value) => updateField('lastName', value)}
              placeholder="Doe"
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Details */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <UnifiedTextField
              id="contact-email"
              section="contact"
              fieldKey="email"
              label="Email Address"
              value={contact.email}
              onChange={(value) => updateField('email', value)}
              placeholder="john.doe@example.com"
              inputType="email"
              required
            />
            <UnifiedTextField
              id="contact-phone"
              section="contact"
              fieldKey="phone"
              label="Phone Number"
              value={contact.phone || ''}
              onChange={(value) => updateField('phone', value)}
              placeholder="+1 (555) 123-4567"
              inputType="tel"
            />
            <UnifiedTextField
              id="contact-location"
              section="contact"
              fieldKey="location"
              label="Location"
              value={contact.location || ''}
              onChange={(value) => updateField('location', value)}
              placeholder="New York, NY"
            />
          </div>
        </CardContent>
      </Card>

      {/* Online Presence */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <UnifiedTextField
              id="contact-linkedin"
              section="contact"
              fieldKey="linkedin"
              label="LinkedIn Profile"
              value={contact.linkedin || ''}
              onChange={(value) => updateField('linkedin', value)}
              placeholder="https://linkedin.com/in/johndoe"
              inputType="url"
            />
            <UnifiedTextField
              id="contact-github"
              section="contact"
              fieldKey="github"
              label="GitHub Profile"
              value={contact.github || ''}
              onChange={(value) => updateField('github', value)}
              placeholder="https://github.com/johndoe"
              inputType="url"
            />
            <UnifiedTextField
              id="contact-website"
              section="contact"
              fieldKey="website"
              label="Personal Website"
              value={contact.website || ''}
              onChange={(value) => updateField('website', value)}
              placeholder="https://johndoe.com"
              inputType="url"
            />
            <UnifiedTextField
              id="contact-portfolio"
              section="contact"
              fieldKey="portfolio"
              label="Portfolio"
              value={contact.portfolio || ''}
              onChange={(value) => updateField('portfolio', value)}
              placeholder="https://portfolio.johndoe.com"
              inputType="url"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
