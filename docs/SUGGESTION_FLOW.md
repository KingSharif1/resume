# Complete Suggestion System Flow

## Overview
This document explains how suggestions work from highlighting in the preview to applying changes to the resume profile.

---

## 📍 PART 1: HIGHLIGHTING IN PREVIEW

### All Sections with Highlighting Support

| Section | Field | Highlighting Method |
|---------|-------|-------------------|
| **Summary** | content | `renderWithHighlights(profile.summary.content, 'summary', undefined, 'content')` |
| **Experience** | position | `renderWithHighlights(exp.position, 'experience', exp.id, 'position')` |
| **Experience** | company | `renderWithHighlights(exp.company, 'experience', exp.id, 'company')` |
| **Experience** | description | `renderWithHighlights(exp.description, 'experience', exp.id, 'description')` |
| **Experience** | achievements[i] | `renderWithHighlights(achievement, 'experience', exp.id, 'achievements[i]')` |
| **Education** | institution | `renderWithHighlights(edu.institution, 'education', edu.id, 'institution')` |
| **Education** | degree | `renderWithHighlights(edu.degree + fieldOfStudy, 'education', edu.id, 'degree')` |
| **Projects** | name | `renderWithHighlights(project.name, 'projects', project.id, 'name')` |
| **Projects** | description | `renderWithHighlights(project.description, 'projects', project.id, 'description')` |
| **Projects** | achievements[i] | `renderWithHighlights(highlight, 'projects', project.id, 'achievements[i]')` |
| **Skills** | individual skills | Custom logic comparing skill arrays |

### How Highlighting Works

1. **Filter suggestions** for the specific field:
   ```typescript
   const relevantSuggestions = inlineSuggestions.filter(s => {
     return s.targetSection === section &&
            s.targetItemId === itemId &&
            s.targetField === field;
   });
   ```

2. **Render with HighlightedText component**:
   - Shows dotted underline with type-specific colors
   - Blue = ATS, Green = Metric, Purple = Wording, Red = Grammar, Orange = Tone
   - Hover makes underline solid and thicker
   - Click adds ring around text

3. **Skills are special** - compares arrays:
   ```typescript
   originalSkills = ["Git", "GitHub"]
   suggestedSkills = ["Git", "GitHub", "Docker", "Kubernetes"]
   // Only highlights: Docker, Kubernetes (new additions)
   ```

---

## 📍 PART 2: APPLYING SUGGESTIONS

When user clicks **"Approve"**, the system calls `applySuggestionToProfile(profile, suggestion)`.

### Type 1: Text Sections (Summary, Experience Description, etc.)

**Data Structure:**
```typescript
profile.summary.content = "A Software Engineer with..."  // Single string
profile.experience[0].description = "Developed and maintained..."
```

**Application Logic:**
```typescript
// 1. Find target text
targetText = profile.experience[0].description

// 2. Use character offsets to replace
before = targetText.substring(0, suggestion.startOffset)
after = targetText.substring(suggestion.endOffset)
newText = before + suggestion.suggestedText + after

// 3. Update profile
profile.experience[0].description = newText
```

**Example:**
```
Original: "Developed and maintained software applications"
Suggestion: Replace "maintained" (offset 19-29) with "optimized"
Result: "Developed and optimized software applications"
```

**Matching Logic:**
1. Find by `targetSection` = "experience"
2. Find by `targetItemId` = experience.id (or fallback to position/company name)
3. Find by `targetField` = "description"
4. Use `startOffset` and `endOffset` for exact replacement

---

### Type 2: Array Sections (Experience Achievements)

**Data Structure:**
```typescript
profile.experience[0].achievements = [
  "Built a responsive portfolio",
  "Deployed the system on Vercel"
]
```

**Application Logic:**
```typescript
// 1. Find which achievement item
achieveIndex = achievements.findIndex(a => a === suggestion.originalText)

// 2. Replace that specific array item using offsets
before = achievements[achieveIndex].substring(0, suggestion.startOffset)
after = achievements[achieveIndex].substring(suggestion.endOffset)
newText = before + suggestion.suggestedText + after

// 3. Update the array
profile.experience[0].achievements[achieveIndex] = newText
```

**Example:**
```
Original: achievements[1] = "Deployed the system on Vercel"
Suggestion: Add ", improving application reliability"
Result: achievements[1] = "Deployed the system on Vercel, improving application reliability"
```

**Matching Logic:**
1. `targetSection` = "experience"
2. `targetItemId` = experience.id
3. `targetField` = "achievements[1]" or "achievements"
4. If field is "achievements" (no index), find by matching `originalText`

---

### Type 3: Skills Section (Array Comparison)

**Data Structure:**
```typescript
profile.skills = {
  "Tools": ["Git", "GitHub", "Heroku"],
  "Languages": ["JavaScript", "Python"]
}
```

**Application Logic:**
```typescript
// 1. Parse category from suggestion text
category = "Tools"  // From "Tools: Git, GitHub, Docker"

// 2. Parse skill lists
originalSkills = ["Git", "GitHub", "Heroku"]
suggestedSkills = ["Git", "GitHub", "Heroku", "Docker", "Kubernetes"]

// 3. Two modes:
if (!suggestion.originalText) {
  // MODE A: Adding new skills only
  suggestedSkills.forEach(skill => {
    if (!profile.skills[category].includes(skill)) {
      profile.skills[category].push(skill)
    }
  })
} else {
  // MODE B: Replace entire list
  profile.skills[category] = suggestedSkills
}
```

**Example:**
```
Original: skills["Tools"] = ["Git", "GitHub"]
Suggestion: "Tools: Git, GitHub, Docker, Kubernetes"
Result: skills["Tools"] = ["Git", "GitHub", "Docker", "Kubernetes"]
```

**Matching Logic:**
1. `targetSection` = "skills"
2. `targetItemId` = category name (e.g., "Tools")
3. NO offsets - compares entire skill lists
4. Parses text format: "Category: skill1, skill2, skill3"

---

## 📍 PART 3: SECTION-SPECIFIC HANDLING

### Summary
- **Field:** `content`
- **Type:** Single string
- **Update Path:** `summary.content`
- **Method:** Character offset replacement

### Experience
- **Fields:** `position`, `company`, `description`, `achievements[i]`
- **Type:** String or array of strings
- **Update Path:** `experience[index].{field}`
- **Matching:** By ID, then position/company name, then first item
- **Method:** Character offset replacement

### Education
- **Fields:** `institution`, `degree`
- **Type:** Single strings
- **Update Path:** `education[index].{field}`
- **Matching:** By ID, then institution name, then first item
- **Method:** Character offset replacement
- **Note:** Degree field combines `degree` + `fieldOfStudy`

### Projects
- **Fields:** `name`, `description`, `achievements[i]`
- **Type:** String or array of strings
- **Update Path:** `projects[index].{field}`
- **Matching:** By ID, then name, then first item
- **Method:** Character offset replacement

### Skills
- **Fields:** Category arrays (e.g., `skills["Tools"]`)
- **Type:** Array of strings
- **Update Path:** `skills[category]`
- **Matching:** By category name from text or `targetItemId`
- **Method:** Array comparison and replacement/addition
- **Special:** No character offsets - works with full skill lists

---

## 📍 PART 4: WHY DIFFERENT SECTIONS NEED DIFFERENT LOGIC

### Text Sections (Summary, Descriptions)
- **Why:** Simple string replacement
- **Uses:** Character offsets for precise edits
- **Example:** Replace word at position 19-29

### Array Sections (Achievements)
- **Why:** Multiple items, need to find correct one
- **Uses:** Array index + character offsets
- **Example:** Edit achievements[1] at position 10-20

### Skills Section
- **Why:** Arrays of keywords, not sentences
- **Uses:** Array comparison (no offsets)
- **Example:** Compare ["Git", "GitHub"] vs ["Git", "GitHub", "Docker"]
- **Reason:** Can't use character offsets because skills are separate items, not continuous text

---

## 📍 PART 5: COMPLETE FLOW DIAGRAM

```
1. AI generates suggestion
   ↓
2. Suggestion created with:
   - targetSection: "experience"
   - targetItemId: "exp_123"
   - targetField: "description"
   - originalText: "maintained"
   - suggestedText: "optimized"
   - startOffset: 19
   - endOffset: 29
   ↓
3. Preview shows highlighting:
   - Finds text in experience[0].description
   - Highlights "maintained" with dotted underline
   - Color based on suggestion.type
   ↓
4. User hovers:
   - Underline becomes solid
   - Suggestion card highlights
   - Scrolls into view
   ↓
5. User clicks "Approve":
   - Calls applySuggestionToProfile()
   - Finds experience[0] by ID
   - Gets description field
   - Replaces characters 19-29
   - Returns updated profile
   ↓
6. Profile updates:
   - State updates with new profile
   - Preview re-renders
   - Suggestion removed from list
   - Resume score recalculated
```

---

## 📍 TROUBLESHOOTING

### Suggestion not highlighting in preview?
- Check if field has `renderWithHighlights()` wrapper
- Verify `targetSection`, `targetItemId`, `targetField` match exactly
- Check console logs for matching issues

### Suggestion not applying correctly?
- Check if `applySuggestionToProfile()` handles that field
- Verify `updatePath` is correct for nested fields
- Check if `startOffset`/`endOffset` are valid for the text

### Skills not working?
- Skills use different logic (array comparison, not offsets)
- Must parse category from text: "Tools: skill1, skill2"
- Check if category name matches exactly
