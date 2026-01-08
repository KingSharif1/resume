# Suggestion Types & Color System

## Visual Color Guide

Each suggestion type has a unique color to help you quickly identify what kind of improvement is being suggested:

---

## 🟦 **ATS (Applicant Tracking System)** - Blue
**Purpose**: Optimize for automated resume screening systems

**What it does:**
- Adds industry-standard keywords
- Includes technical terms that ATS systems scan for
- Ensures proper formatting for machine readability

**Examples:**
- Adding "Agile" to methodologies
- Including "AWS" in deployment tools
- Adding "React.js" instead of just "React"

**Visual:**
- Badge: Blue background with blue text
- Icon: Blue lightbulb
- Highlight: Light blue background

**Why it matters:** 75% of resumes are rejected by ATS before a human sees them. These suggestions help you pass the automated screening.

---

## 🟩 **METRIC** - Green
**Purpose**: Add quantifiable results and measurable impact

**What it does:**
- Converts vague statements into specific numbers
- Adds percentages, dollar amounts, time saved
- Shows concrete business impact

**Examples:**
- "reduced costs" → "reduced costs by 30%"
- "improved performance" → "improved performance by 2x"
- "managed team" → "managed team of 8 developers"

**Visual:**
- Badge: Green background with green text
- Icon: Green lightbulb
- Highlight: Light green background

**Why it matters:** Recruiters spend 6 seconds scanning resumes. Numbers catch their eye and prove your impact.

---

## 🟪 **WORDING** - Purple
**Purpose**: Strengthen action verbs and professional language

**What it does:**
- Replaces weak verbs with powerful action words
- Improves sentence structure
- Makes language more impactful and professional

**Examples:**
- "Worked on" → "Engineered"
- "Helped with" → "Led"
- "Made" → "Architected"
- "Did" → "Executed"

**Visual:**
- Badge: Purple background with purple text
- Icon: Purple lightbulb
- Highlight: Light purple background

**Why it matters:** Strong action verbs convey leadership and ownership. They make you sound more senior and capable.

---

## 🟥 **GRAMMAR/TYPO** - Red
**Purpose**: Fix spelling, punctuation, and grammatical errors

**What it does:**
- Corrects spelling mistakes
- Fixes punctuation errors
- Ensures proper tense consistency
- Catches typos

**Examples:**
- "developped" → "developed"
- "lead" (past) → "led"
- "their" → "there"
- Missing periods or commas

**Visual:**
- Badge: Red background with red text
- Icon: Red lightbulb
- Highlight: Light red background

**Why it matters:** A single typo can disqualify you. It signals lack of attention to detail.

---

## 🟧 **TONE/FORMATTING** - Orange
**Purpose**: Adjust formality and presentation style

**What it does:**
- Makes language more/less formal as needed
- Adjusts voice to match industry standards
- Improves readability and flow
- Ensures consistent formatting

**Examples:**
- Too casual: "I worked on stuff" → "Developed solutions"
- Too formal: "Utilized" → "Used"
- Inconsistent: Mix of first/third person

**Visual:**
- Badge: Orange background with orange text
- Icon: Orange lightbulb
- Highlight: Light orange background

**Why it matters:** Different industries expect different tones. Tech is more casual, finance is more formal.

---

## How to Use This System

### **When Scanning Your Resume:**

1. **Red suggestions (Grammar)** - Fix these FIRST. They're errors.
2. **Blue suggestions (ATS)** - Apply these if targeting specific roles/companies
3. **Green suggestions (Metrics)** - Add these wherever you have achievements
4. **Purple suggestions (Wording)** - Use these to strengthen your language
5. **Orange suggestions (Tone)** - Apply based on your target industry

### **Visual Hierarchy:**

```
🟥 Red = ERROR (must fix)
🟧 Orange = ADJUSTMENT (should consider)
🟦 Blue = OPTIMIZATION (helps with ATS)
🟩 Green = ENHANCEMENT (adds impact)
🟪 Purple = REFINEMENT (improves quality)
```

### **In the UI:**

Each suggestion card shows:
- **Colored icon** (lightbulb) - Quick visual identifier
- **Colored badge** - Type label (ATS, METRIC, etc.)
- **Colored highlight** - Suggested text background
- **Section name** - Where the change applies

### **Example Suggestion Card:**

```
┌─────────────────────────────────────────┐
│ 🟩 METRIC  work experience              │
│                                          │
│ ❌ reduced ticket resolution time       │
│ ✅ reduced ticket resolution time by 20%│
│                                          │
│ Why: Adding specific metrics enhances   │
│      the impact of your achievement     │
│                                          │
│ [Deny]  [Comment]  [Ask AI]  [Approve] │
└─────────────────────────────────────────┘
```

---

## Priority Guide

### **For Job Applications:**
1. Fix all **Grammar** (red) first
2. Add **Metrics** (green) to achievements
3. Optimize for **ATS** (blue) with job posting keywords
4. Improve **Wording** (purple) for impact
5. Adjust **Tone** (orange) for industry

### **For LinkedIn/Portfolio:**
- Focus on **Metrics** (green) and **Wording** (purple)
- Less emphasis on **ATS** (blue)
- More casual **Tone** (orange) acceptable

### **For Senior Roles:**
- Emphasize **Metrics** (green) - prove leadership impact
- Strong **Wording** (purple) - show authority
- Less **ATS** (blue) - senior roles have human reviewers

### **For Entry-Level:**
- Focus on **ATS** (blue) - get past automated screening
- Add any **Metrics** (green) you can (even from projects/school)
- Professional **Tone** (orange) - show maturity

---

## Technical Implementation

The color system is implemented in `SuggestionCard.tsx`:

```typescript
const getTypeColor = (type: string) => {
  const primaryType = type.split(',')[0].trim().toLowerCase();
  
  switch (primaryType) {
    case 'ats': return { /* blue colors */ };
    case 'metric': return { /* green colors */ };
    case 'wording': return { /* purple colors */ };
    case 'grammar': return { /* red colors */ };
    case 'tone': return { /* orange colors */ };
  }
};
```

Colors are applied to:
- Icon background and text
- Badge background, text, and border
- Suggested text highlight
- Left border accent

---

## Accessibility

All color combinations meet WCAG AA standards for contrast:
- Text is always dark enough to read on light backgrounds
- Icons have sufficient contrast
- Borders provide additional visual separation

Color is not the only indicator - each suggestion also has:
- Text label (ATS, METRIC, etc.)
- Icon (lightbulb)
- Section name
- Detailed reason

This ensures the system is usable even for colorblind users.
