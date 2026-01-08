# Resume Section Field Mapping

This document maps each resume section to its data structure, field names, and how they're used in highlighting and application logic.

---

## 1. **Contact Info** (`contact`)

### Data Structure:
```typescript
interface ContactInfo {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  portfolio?: string;
}
```

### Preview Fields:
- `name` - Combined: `${firstName} ${middleName || ''} ${lastName}`
- `email`
- `phone`
- `location`
- `linkedin`
- `github`
- `website`

### Suggestion Fields:
- `targetField: 'name'` - Full name
- `targetField: 'email'`
- `targetField: 'phone'`
- `targetField: 'location'`

---

## 2. **Summary** (`summary`)

### Data Structure:
```typescript
interface Summary {
  content: string;
}
```

### Preview Fields:
- `content` - The full summary text

### Suggestion Fields:
- `targetField: 'content'`
- `targetItemId: undefined` (no item ID needed)

---

## 3. **Experience** (`experience` or `work_experience`)

### Data Structure:
```typescript
interface WorkExperience {
  id: string;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  achievements: string[];
  skills?: string[];
  visible?: boolean;
}
```

### Preview Fields:
- `position` - Job title
- `company` - Company name
- `description` - Job description
- `achievements[0]`, `achievements[1]`, etc. - Individual bullet points

### Suggestion Fields:
- `targetItemId: <experience.id>` - The ID of the specific experience entry
- `targetField: 'position'`
- `targetField: 'company'`
- `targetField: 'description'`
- `targetField: 'achievements[0]'` - Specific achievement by index

---

## 4. **Education** (`education`)

### Data Structure:
```typescript
interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  gpa?: string;
  honors?: string[];
  coursework?: string[];
  activities?: string[];
  visible?: boolean;
}
```

### Preview Fields:
- **Combined format**: `"${degree}${fieldOfStudy ? ' in ' + fieldOfStudy : ''} from ${institution}"`
  - Example: "B.S. in Computer Science from Harvard University"

### Suggestion Fields:
- `targetItemId: <education.id>` - The ID of the specific education entry
- `targetField: 'content'` - **Combined format** (degree + fieldOfStudy + institution)
- `targetField: 'institution'` - University name only
- `targetField: 'degree'` - Degree only (e.g., "B.S.")
- `targetField: 'fieldOfStudy'` - Field only (e.g., "Computer Science")

### Application Logic:
When `targetField: 'content'`:
- Parses suggested text: `"degree [in fieldOfStudy] from institution"`
- Updates all three fields: `degree`, `fieldOfStudy`, `institution`

---

## 5. **Projects** (`projects`)

### Data Structure:
```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  technologies: string[];
  url?: string;
  github?: string;
  achievements: string[];
  visible?: boolean;
}
```

### Preview Fields:
- `name` - Project name
- `description` - Project description
- `achievements[0]`, `achievements[1]`, etc. - Individual bullet points

### Suggestion Fields:
- `targetItemId: <project.id>` - The ID of the specific project
- `targetField: 'name'`
- `targetField: 'description'`
- `targetField: 'achievements[0]'` - Specific achievement by index

---

## 6. **Skills** (`skills`)

### Data Structure:
```typescript
interface Skills {
  [category: string]: string[];
}

// Example:
{
  "Tools": ["Git", "GitHub", "Docker"],
  "Languages": ["JavaScript", "Python", "Java"],
  "Frameworks": ["React", "Next.js", "Node.js"]
}
```

### Preview Fields:
- Skills are rendered by category
- Each category shows all skills in that category
- When suggestion exists, shows **suggested skills** (original + new)

### Suggestion Fields:
- `targetItemId: <category>` - The category name (e.g., "Tools", "Languages")
- `targetField: null` - No field needed
- `originalText: "Tools: Git, GitHub, Heroku"` - Category + current skills
- `suggestedText: "Tools: Git, GitHub, Heroku, Docker, Kubernetes"` - Category + all skills (existing + new)

### Application Logic:
- Parses category from text (before colon)
- Parses skills from text (after colon, comma-separated)
- If `originalText` is empty: **adds** new skills to category
- If `originalText` exists: **replaces** entire skill list for category

---

## 7. **Certifications** (`certifications`)

### Data Structure:
```typescript
interface Certification {
  id: string;
  name: string;
  issuer: string;
  date?: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
  visible?: boolean;
}
```

### Preview Fields:
- `name` - Certification name
- `issuer` - Issuing organization

### Suggestion Fields:
- `targetItemId: <certification.id>` - The ID of the specific certification
- `targetField: 'name'`
- `targetField: 'issuer'`

---

## 8. **Volunteer** (`volunteer`)

### Data Structure:
```typescript
interface VolunteerExperience {
  id: string;
  organization: string;
  role: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current: boolean;
  description: string;
  achievements: string[];
  visible?: boolean;
}
```

### Preview Fields:
- `role` - Volunteer role/position
- `organization` - Organization name
- `description` - Description of volunteer work

### Suggestion Fields:
- `targetItemId: <volunteer.id>` - The ID of the specific volunteer entry
- `targetField: 'role'`
- `targetField: 'organization'`
- `targetField: 'description'`

---

## 9. **Languages** (`languages`)

### Data Structure:
```typescript
interface Language {
  id: string;
  name: string;
  proficiency: 'Native' | 'Fluent' | 'Advanced' | 'Intermediate' | 'Basic';
  certification?: string;
  visible?: boolean;
}
```

### Preview Fields:
- `name` - Language name
- `proficiency` - Proficiency level

### Suggestion Fields:
- `targetItemId: <language.id>` - The ID of the specific language entry
- `targetField: 'name'`
- `targetField: 'proficiency'`

---

## 10. **References** (`references`)

### Data Structure:
```typescript
interface Reference {
  id: string;
  name: string;
  title: string;
  company: string;
  email?: string;
  phone?: string;
  relationship: string;
  visible?: boolean;
}
```

### Preview Fields:
- `name` - Reference name
- `title` - Reference job title
- `company` - Reference company
- `email` - Reference email
- `phone` - Reference phone

### Suggestion Fields:
- `targetItemId: <reference.id>` - The ID of the specific reference
- `targetField: 'name'`
- `targetField: 'title'`
- `targetField: 'company'`
- `targetField: 'email'`
- `targetField: 'phone'`

---

## Key Patterns

### 1. **Text Fields** (Summary, Description, etc.)
- Use `renderWithHighlights(text, section, itemId, field)`
- Application uses character offsets to replace text

### 2. **Array Fields** (Achievements, Technologies, etc.)
- Use `renderWithHighlights(item, section, itemId, 'achievements[0]')`
- Application targets specific array index

### 3. **Skills** (Special Case)
- Category-based structure
- Suggestions include category name in text
- Application adds or replaces entire category list

### 4. **Combined Fields** (Education)
- Multiple fields combined into one text for preview
- Suggestion targets combined text
- Application parses and updates individual fields

---

## Highlighting Requirements

For a suggestion to highlight in the preview:

1. **Section must match**: `suggestion.targetSection === section` (case-insensitive)
2. **Item ID must match** (if specified): `suggestion.targetItemId === itemId`
3. **Field must match** (if specified): `suggestion.targetField === field`
4. **Original text must exist in preview**: Fallback matching by text content

---

## Application Requirements

For a suggestion to apply correctly:

1. **Section handler exists** in `applySuggestionToProfile()`
2. **Field handler exists** for the specific `targetField`
3. **Item can be found** by ID or fallback matching
4. **Update path is correct** for nested field access

---

## Current Status

### ✅ Fully Implemented:
- Summary
- Experience (position, company, description, achievements)
- Projects (name, description, achievements)
- Skills (all categories)
- Contact (name, email, phone, location)
- Education (content/combined format)
- Certifications (name, issuer)
- Volunteer (role, organization, description)
- Languages (name, proficiency)
- References (name, title, company, email, phone)

### ⚠️ Partially Implemented:
- Education (individual fields: institution, degree, fieldOfStudy not tested separately)

### ❌ Not Implemented:
- Awards
- Publications
- Interests
- Custom Sections
