/**
 * Resume Text Extraction Utility
 * 
 * Extracts all searchable text fields from a resume profile.
 * Used for scoring, AI context, typo detection, and highlighting.
 */

import { ResumeProfile, SectionType } from '../resume-schema';
import { FieldValue, generateFieldId, generateListItemId } from './field-types';

// Section visibility type
export interface SectionVisibility {
  [key: string]: boolean;
}

// Default visibility - matches the active sections in the UI
export const DEFAULT_SECTION_VISIBILITY: SectionVisibility = {
  contact: true,
  summary: true,
  experience: true,
  education: true,
  projects: true,
  skills: true,
  certifications: true,
  volunteer: true,
  awards: false,
  publications: false,
  languages: true,
  references: true,
  interests: false,
};

/**
 * Extract all searchable text fields from a resume profile
 * Returns a flat array of FieldValue objects with consistent element IDs
 * @param profile - The resume profile to extract text from
 * @param sectionVisibility - Optional filter to only include visible sections
 */
export function extractAllResumeText(
  profile: ResumeProfile, 
  sectionVisibility: SectionVisibility = DEFAULT_SECTION_VISIBILITY
): FieldValue[] {
  const fields: FieldValue[] = [];
  
  // Helper to check if section is visible
  const isSectionVisible = (section: SectionType): boolean => {
    return sectionVisibility[section] !== false;
  };

  // Contact section
  if (isSectionVisible('contact') && profile.contact) {
    const contact = profile.contact;
    const section: SectionType = 'contact';
    
    if (contact.firstName) {
      fields.push({
        section,
        fieldKey: 'firstName',
        value: contact.firstName,
        elementId: generateFieldId(section, 'firstName'),
        label: 'First Name',
      });
    }
    if (contact.middleName) {
      fields.push({
        section,
        fieldKey: 'middleName',
        value: contact.middleName,
        elementId: generateFieldId(section, 'middleName'),
        label: 'Middle Name',
      });
    }
    if (contact.lastName) {
      fields.push({
        section,
        fieldKey: 'lastName',
        value: contact.lastName,
        elementId: generateFieldId(section, 'lastName'),
        label: 'Last Name',
      });
    }
    if (contact.location) {
      fields.push({
        section,
        fieldKey: 'location',
        value: contact.location,
        elementId: generateFieldId(section, 'location'),
        label: 'Location',
      });
    }
  }

  // Summary section
  if (isSectionVisible('summary') && profile.summary?.content) {
    fields.push({
      section: 'summary',
      fieldKey: 'content',
      value: profile.summary.content,
      elementId: generateFieldId('summary', 'content'),
      label: 'Professional Summary',
    });
  }

  // Experience section
  if (isSectionVisible('experience')) profile.experience?.forEach((exp, index) => {
    const section: SectionType = 'experience';
    const itemId = exp.id;

    if (exp.company) {
      fields.push({
        section,
        itemId,
        itemIndex: index,
        fieldKey: 'company',
        value: exp.company,
        elementId: generateFieldId(section, 'company', itemId),
        label: 'Company',
      });
    }
    if (exp.position) {
      fields.push({
        section,
        itemId,
        itemIndex: index,
        fieldKey: 'position',
        value: exp.position,
        elementId: generateFieldId(section, 'position', itemId),
        label: 'Position',
      });
    }
    if (exp.location) {
      fields.push({
        section,
        itemId,
        itemIndex: index,
        fieldKey: 'location',
        value: exp.location,
        elementId: generateFieldId(section, 'location', itemId),
        label: 'Location',
      });
    }
    if (exp.description) {
      fields.push({
        section,
        itemId,
        itemIndex: index,
        fieldKey: 'description',
        value: exp.description,
        elementId: generateFieldId(section, 'description', itemId),
        label: 'Description',
      });
    }
    exp.achievements?.forEach((achievement, achIndex) => {
      if (achievement) {
        fields.push({
          section,
          itemId,
          itemIndex: index,
          fieldKey: `achievements[${achIndex}]`,
          value: achievement,
          elementId: generateListItemId(section, 'achievements', itemId, index, achIndex),
          label: `Achievement ${achIndex + 1}`,
        });
      }
    });
  });

  // Education section
  if (isSectionVisible('education')) profile.education?.forEach((edu, index) => {
    const section: SectionType = 'education';
    const itemId = edu.id;

    if (edu.institution) {
      fields.push({
        section,
        itemId,
        itemIndex: index,
        fieldKey: 'institution',
        value: edu.institution,
        elementId: generateFieldId(section, 'institution', itemId),
        label: 'Institution',
      });
    }
    if (edu.degree) {
      fields.push({
        section,
        itemId,
        itemIndex: index,
        fieldKey: 'degree',
        value: edu.degree,
        elementId: generateFieldId(section, 'degree', itemId),
        label: 'Degree',
      });
    }
    if (edu.fieldOfStudy) {
      fields.push({
        section,
        itemId,
        itemIndex: index,
        fieldKey: 'fieldOfStudy',
        value: edu.fieldOfStudy,
        elementId: generateFieldId(section, 'fieldOfStudy', itemId),
        label: 'Field of Study',
      });
    }
    if (edu.location) {
      fields.push({
        section,
        itemId,
        itemIndex: index,
        fieldKey: 'location',
        value: edu.location,
        elementId: generateFieldId(section, 'location', itemId),
        label: 'Location',
      });
    }
    edu.honors?.forEach((honor, hIndex) => {
      if (honor) {
        fields.push({
          section,
          itemId,
          itemIndex: index,
          fieldKey: `honors[${hIndex}]`,
          value: honor,
          elementId: generateListItemId(section, 'honors', itemId, index, hIndex),
          label: `Honor ${hIndex + 1}`,
        });
      }
    });
    edu.coursework?.forEach((course, cIndex) => {
      if (course) {
        fields.push({
          section,
          itemId,
          itemIndex: index,
          fieldKey: `coursework[${cIndex}]`,
          value: course,
          elementId: generateListItemId(section, 'coursework', itemId, index, cIndex),
          label: `Coursework ${cIndex + 1}`,
        });
      }
    });
    edu.activities?.forEach((activity, aIndex) => {
      if (activity) {
        fields.push({
          section,
          itemId,
          itemIndex: index,
          fieldKey: `activities[${aIndex}]`,
          value: activity,
          elementId: generateListItemId(section, 'activities', itemId, index, aIndex),
          label: `Activity ${aIndex + 1}`,
        });
      }
    });
  });

  // Projects section
  if (isSectionVisible('projects')) profile.projects?.forEach((proj, index) => {
    const section: SectionType = 'projects';
    const itemId = proj.id;

    if (proj.name) {
      fields.push({
        section,
        itemId,
        itemIndex: index,
        fieldKey: 'name',
        value: proj.name,
        elementId: generateFieldId(section, 'name', itemId),
        label: 'Project Name',
      });
    }
    if (proj.description) {
      fields.push({
        section,
        itemId,
        itemIndex: index,
        fieldKey: 'description',
        value: proj.description,
        elementId: generateFieldId(section, 'description', itemId),
        label: 'Description',
      });
    }
    if (proj.role) {
      fields.push({
        section,
        itemId,
        itemIndex: index,
        fieldKey: 'role',
        value: proj.role,
        elementId: generateFieldId(section, 'role', itemId),
        label: 'Role',
      });
    }
    proj.achievements?.forEach((achievement, achIndex) => {
      if (achievement) {
        fields.push({
          section,
          itemId,
          itemIndex: index,
          fieldKey: `achievements[${achIndex}]`,
          value: achievement,
          elementId: generateListItemId(section, 'achievements', itemId, index, achIndex),
          label: `Achievement ${achIndex + 1}`,
        });
      }
    });
  });

  // Volunteer section
  if (isSectionVisible('volunteer')) profile.volunteer?.forEach((vol, index) => {
    const section: SectionType = 'volunteer';
    const itemId = vol.id;

    if (vol.organization) {
      fields.push({
        section,
        itemId,
        itemIndex: index,
        fieldKey: 'organization',
        value: vol.organization,
        elementId: generateFieldId(section, 'organization', itemId),
        label: 'Organization',
      });
    }
    if (vol.role) {
      fields.push({
        section,
        itemId,
        itemIndex: index,
        fieldKey: 'role',
        value: vol.role,
        elementId: generateFieldId(section, 'role', itemId),
        label: 'Role',
      });
    }
    if (vol.location) {
      fields.push({
        section,
        itemId,
        itemIndex: index,
        fieldKey: 'location',
        value: vol.location,
        elementId: generateFieldId(section, 'location', itemId),
        label: 'Location',
      });
    }
    if (vol.description) {
      fields.push({
        section,
        itemId,
        itemIndex: index,
        fieldKey: 'description',
        value: vol.description,
        elementId: generateFieldId(section, 'description', itemId),
        label: 'Description',
      });
    }
    vol.achievements?.forEach((achievement, achIndex) => {
      if (achievement) {
        fields.push({
          section,
          itemId,
          itemIndex: index,
          fieldKey: `achievements[${achIndex}]`,
          value: achievement,
          elementId: generateListItemId(section, 'achievements', itemId, index, achIndex),
          label: `Achievement ${achIndex + 1}`,
        });
      }
    });
  });

  // Certifications section
  if (isSectionVisible('certifications')) profile.certifications?.forEach((cert, index) => {
    const section: SectionType = 'certifications';
    const itemId = cert.id;

    if (cert.name) {
      fields.push({
        section,
        itemId,
        itemIndex: index,
        fieldKey: 'name',
        value: cert.name,
        elementId: generateFieldId(section, 'name', itemId),
        label: 'Certification Name',
      });
    }
    if (cert.issuer) {
      fields.push({
        section,
        itemId,
        itemIndex: index,
        fieldKey: 'issuer',
        value: cert.issuer,
        elementId: generateFieldId(section, 'issuer', itemId),
        label: 'Issuer',
      });
    }
    if (cert.credentialId) {
      fields.push({
        section,
        itemId,
        itemIndex: index,
        fieldKey: 'credentialId',
        value: cert.credentialId,
        elementId: generateFieldId(section, 'credentialId', itemId),
        label: 'Credential ID',
      });
    }
  });

  // Awards section
  if (isSectionVisible('awards')) profile.awards?.forEach((award, index) => {
    const section: SectionType = 'awards';
    const itemId = award.id;

    if (award.title) {
      fields.push({
        section,
        itemId,
        itemIndex: index,
        fieldKey: 'title',
        value: award.title,
        elementId: generateFieldId(section, 'title', itemId),
        label: 'Award Title',
      });
    }
    if (award.issuer) {
      fields.push({
        section,
        itemId,
        itemIndex: index,
        fieldKey: 'issuer',
        value: award.issuer,
        elementId: generateFieldId(section, 'issuer', itemId),
        label: 'Issuer',
      });
    }
    if (award.description) {
      fields.push({
        section,
        itemId,
        itemIndex: index,
        fieldKey: 'description',
        value: award.description,
        elementId: generateFieldId(section, 'description', itemId),
        label: 'Description',
      });
    }
  });

  // Publications section
  if (isSectionVisible('publications')) profile.publications?.forEach((pub, index) => {
    const section: SectionType = 'publications';
    const itemId = pub.id;

    if (pub.title) {
      fields.push({
        section,
        itemId,
        itemIndex: index,
        fieldKey: 'title',
        value: pub.title,
        elementId: generateFieldId(section, 'title', itemId),
        label: 'Publication Title',
      });
    }
    if (pub.publisher) {
      fields.push({
        section,
        itemId,
        itemIndex: index,
        fieldKey: 'publisher',
        value: pub.publisher,
        elementId: generateFieldId(section, 'publisher', itemId),
        label: 'Publisher',
      });
    }
    if (pub.description) {
      fields.push({
        section,
        itemId,
        itemIndex: index,
        fieldKey: 'description',
        value: pub.description,
        elementId: generateFieldId(section, 'description', itemId),
        label: 'Description',
      });
    }
    pub.authors?.forEach((author, aIndex) => {
      if (author) {
        fields.push({
          section,
          itemId,
          itemIndex: index,
          fieldKey: `authors[${aIndex}]`,
          value: author,
          elementId: generateListItemId(section, 'authors', itemId, index, aIndex),
          label: `Author ${aIndex + 1}`,
        });
      }
    });
  });

  // Languages section
  if (isSectionVisible('languages')) profile.languages?.forEach((lang, index) => {
    const section: SectionType = 'languages';
    const itemId = lang.id;

    if (lang.name) {
      fields.push({
        section,
        itemId,
        itemIndex: index,
        fieldKey: 'name',
        value: lang.name,
        elementId: generateFieldId(section, 'name', itemId),
        label: 'Language',
      });
    }
    if (lang.certification) {
      fields.push({
        section,
        itemId,
        itemIndex: index,
        fieldKey: 'certification',
        value: lang.certification,
        elementId: generateFieldId(section, 'certification', itemId),
        label: 'Certification',
      });
    }
  });

  // References section
  if (isSectionVisible('references')) profile.references?.forEach((ref, index) => {
    const section: SectionType = 'references';
    const itemId = ref.id;

    if (ref.name) {
      fields.push({
        section,
        itemId,
        itemIndex: index,
        fieldKey: 'name',
        value: ref.name,
        elementId: generateFieldId(section, 'name', itemId),
        label: 'Reference Name',
      });
    }
    if (ref.title) {
      fields.push({
        section,
        itemId,
        itemIndex: index,
        fieldKey: 'title',
        value: ref.title,
        elementId: generateFieldId(section, 'title', itemId),
        label: 'Title',
      });
    }
    if (ref.company) {
      fields.push({
        section,
        itemId,
        itemIndex: index,
        fieldKey: 'company',
        value: ref.company,
        elementId: generateFieldId(section, 'company', itemId),
        label: 'Company',
      });
    }
    if (ref.relationship) {
      fields.push({
        section,
        itemId,
        itemIndex: index,
        fieldKey: 'relationship',
        value: ref.relationship,
        elementId: generateFieldId(section, 'relationship', itemId),
        label: 'Relationship',
      });
    }
  });

  // Interests section
  if (isSectionVisible('interests')) profile.interests?.forEach((interest, index) => {
    const section: SectionType = 'interests';
    const itemId = interest.id;

    if (interest.name) {
      fields.push({
        section,
        itemId,
        itemIndex: index,
        fieldKey: 'name',
        value: interest.name,
        elementId: generateFieldId(section, 'name', itemId),
        label: 'Interest',
      });
    }
    if (interest.description) {
      fields.push({
        section,
        itemId,
        itemIndex: index,
        fieldKey: 'description',
        value: interest.description,
        elementId: generateFieldId(section, 'description', itemId),
        label: 'Description',
      });
    }
  });

  return fields;
}

/**
 * Get full resume text as a single string (for AI context)
 */
export function getResumeFullText(
  profile: ResumeProfile, 
  sectionVisibility?: SectionVisibility
): string {
  const fields = extractAllResumeText(profile, sectionVisibility);
  return fields.map(f => f.value).join(' ');
}

/**
 * Search resume for text matches
 */
export function searchResumeText(
  profile: ResumeProfile, 
  query: string,
  sectionVisibility?: SectionVisibility
): FieldValue[] {
  const fields = extractAllResumeText(profile, sectionVisibility);
  const lowerQuery = query.toLowerCase();
  return fields.filter(f => f.value.toLowerCase().includes(lowerQuery));
}

/**
 * Get total word count across all resume text
 */
export function getResumeWordCount(
  profile: ResumeProfile,
  sectionVisibility?: SectionVisibility
): number {
  const fullText = getResumeFullText(profile, sectionVisibility);
  return fullText.split(/\s+/).filter(w => w.length > 0).length;
}

/**
 * Get character count across all resume text
 */
export function getResumeCharCount(
  profile: ResumeProfile,
  sectionVisibility?: SectionVisibility
): number {
  const fullText = getResumeFullText(profile, sectionVisibility);
  return fullText.length;
}
