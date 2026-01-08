# AI Suggestion System Documentation

## Overview
The AI Suggestion System provides intelligent, context-aware recommendations to improve resume content. It uses inline suggestions similar to Google Docs comments, with precise targeting and real-time preview updates.

---

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    1. USER INITIATES SCAN                        │
│  User clicks "Scan Resume" button in UnifiedAnalysisPanel       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    2. API REQUEST SENT                           │
│  POST /api/ai/analyze-resume                                     │
│  Body: { profile: ResumeProfile, targetJob: string }           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    3. AI ANALYSIS                                │
│  - Analyzes entire resume content                               │
│  - Checks for ATS keywords, metrics, wording                    │
│  - Generates suggestions with precise targeting                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    4. API RESPONSE                               │
│  Returns array of InlineSuggestion objects:                     │
│  {                                                               │
│    id: "uuid",                                                   │
│    type: "ats" | "metric" | "wording" | "grammar",             │
│    severity: "error" | "warning" | "suggestion",               │
│    targetSection: "experience" | "skills" | "summary",         │
│    targetItemId: "item-uuid" or "Item Name",                   │
│    targetField: "description" | "achievements",                │
│    originalText: "text to replace",                            │
│    suggestedText: "replacement text",                          │
│    startOffset: 0,                                             │
│    endOffset: 0,                                               │
│    reason: "why this is better"                                │
│  }                                                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    5. DISPLAY SUGGESTIONS                        │
│  - Suggestions stored in state: inlineSuggestions[]            │
│  - Rendered as SuggestionCard components                        │
│  - Shows: type badge, section, original vs suggested text      │
│  - User can: Approve, Deny, or Comment                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    6. USER CLICKS "APPROVE"                      │
│  Triggers: handleApplySuggestion(suggestion)                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    7. APPLY SUGGESTION                           │
│  applySuggestionToProfile(profile, suggestion)                  │
│                                                                  │
│  Step 7a: Normalize Section Name                               │
│    "work experience" → "experience"                             │
│    "professional summary" → "summary"                           │
│                                                                  │
│  Step 7b: Find Target Item                                     │
│    - Try matching by ID                                         │
│    - Try matching by name/position                             │
│    - Fallback to first item                                     │
│                                                                  │
│  Step 7c: Locate Field                                         │
│    - description, achievements[0], etc.                         │
│                                                                  │
│  Step 7d: Apply Text Replacement                               │
│    if (startOffset === 0 && endOffset === 0)                   │
│      → Replace entire text                                      │
│    else                                                          │
│      → Replace substring using offsets                          │
│                                                                  │
│  Step 7e: Return Updated Profile                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    8. UPDATE STATE                               │
│  - setProfile(updatedProfile) → triggers re-render             │
│  - Remove suggestion from list                                  │
│  - Add entry to changelog                                       │
│  - Show success toast                                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    9. PREVIEW UPDATES                            │
│  - React detects profile state change                           │
│  - FullPageResumePreview re-renders                            │
│  - User sees updated content immediately                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Section-Specific Handling

### **Summary / Professional Summary**
```javascript
targetSection: "summary" or "professional summary"
targetItemId: null
targetField: "content" or "description"
originalText: current summary text
suggestedText: improved summary text
```
**How it works:**
- Replaces entire summary content
- No item matching needed (single field)

---

### **Experience / Work Experience**
```javascript
targetSection: "experience" or "work experience"
targetItemId: "experience-uuid" or "Position at Company"
targetField: "description" or "achievements"
originalText: current text
suggestedText: improved text
```
**How it works:**
1. Find experience item by:
   - ID match: `exp.id === targetItemId`
   - Name match: `exp.position === targetItemId`
   - Company match: `exp.company === targetItemId`
   - Fallback: First experience item
2. Update field:
   - `description`: Replace job description
   - `achievements`: Find matching achievement by text, replace it

---

### **Projects**
```javascript
targetSection: "projects"
targetItemId: "project-uuid" or "Project Name"
targetField: "description" or "content"
originalText: current text
suggestedText: improved text
```
**How it works:**
1. Find project by:
   - ID match: `proj.id === targetItemId`
   - Name match: `proj.name === targetItemId`
2. Handle field name variations:
   - `content` → mapped to `description`

---

### **Skills**
```javascript
targetSection: "skills"
targetItemId: "Category Name" (e.g., "Web Development")
targetField: null
originalText: "" (empty for adding) or "skill1, skill2" (for replacing)
suggestedText: "NewSkill" or "skill1, skill2, skill3"
```
**How it works:**
- **Adding skills**: No originalText, adds to category
- **Replacing skills**: Has originalText, replaces entire category
- Skills are comma-separated and trimmed
- **Why no highlighting?** Skills are arrays, not text fields

---

## Common Issues & Solutions

### Issue 1: "No target found for suggestion"
**Cause:** Section name or item ID doesn't match profile structure

**Solution:**
- Check console logs for exact values
- Verify section name normalization
- Ensure item IDs or names match

**Debug:**
```javascript
console.log('[applySuggestionToProfile] Processing:', {
  section: suggestion.targetSection,
  itemId: suggestion.targetItemId,
  field: suggestion.targetField,
});
```

---

### Issue 2: Text duplicated instead of replaced
**Cause:** Both `startOffset` and `endOffset` are 0

**Solution:** Already fixed - when both are 0, replace entire text
```javascript
if (suggestion.startOffset === 0 && suggestion.endOffset === 0) {
  return suggestion.suggestedText;
}
```

---

### Issue 3: Skills not updating
**Cause:** Skills are arrays, not text fields - different handling required

**Solution:**
- Skills suggestions add to or replace array items
- No text highlighting for array operations
- Check if category name matches exactly

---

### Issue 4: Preview not updating
**Cause:** Profile state not triggering re-render

**Solution:**
- Ensure `setProfile()` is called with new object
- Use `JSON.parse(JSON.stringify())` to deep clone
- Verify React detects the state change

---

## Debugging Checklist

When a suggestion doesn't work:

1. **Check Console Logs:**
   ```
   [Apply Suggestion] - Shows type, section, field
   [applySuggestionToProfile] Processing - Shows what's being processed
   [applySuggestionToProfile] Skills suggestion - For skills specifically
   ```

2. **Verify API Response:**
   - Is `targetSection` correct?
   - Is `targetItemId` an ID or a name?
   - Is `targetField` correct?
   - Are `originalText` and `suggestedText` present?

3. **Check Profile Structure:**
   - Does the section exist?
   - Does the item exist?
   - Does the field exist?

4. **Validate State Update:**
   - Did `setProfile()` get called?
   - Did the profile object change?
   - Did the preview re-render?

---

## File Locations

- **Main Logic:** `lib/inline-suggestions.ts`
- **Apply Function:** `applySuggestionToProfile()`
- **Builder Component:** `components/BaseResumeBuilder/NewResumeBuilder.tsx`
- **Suggestion Cards:** `components/SuggestionCard.tsx`
- **Analysis Panel:** `components/BaseResumeBuilder/UnifiedAnalysisPanel.tsx`
- **Changelog:** `components/ChangelogPanel.tsx`

---

## Future Improvements

1. **Better Highlighting:**
   - Use actual character offsets from API
   - Highlight specific text in preview
   - Show diff view for changes

2. **Batch Operations:**
   - Apply multiple suggestions at once
   - Undo/redo functionality

3. **Smart Matching:**
   - Fuzzy matching for item names
   - Better handling of renamed items

4. **Skills Enhancement:**
   - Visual highlighting for skill additions
   - Category suggestions
   - Skill reordering

---

## Testing

To test suggestions:
1. Add console logs in `applySuggestionToProfile`
2. Click "Scan Resume"
3. Review suggestions in panel
4. Click "Approve" on a suggestion
5. Check console for processing logs
6. Verify preview updates
7. Check changelog for entry
