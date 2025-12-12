# Resume Analysis Dashboard

A professional dashboard component for displaying AI-powered resume analysis and suggestions.

## Features

- **Score Visualization**: Animated progress bar showing overall optimization score.
- **Interactive Suggestions**: Clean cards displaying "Before vs After" comparisons.
- **Inline Reply**: Integrated reply functionality that allows users to discuss specific suggestions.
- **Professional UI**: Polished aesthetic with clear typography, badges, and smooth animations.
- **Action Workflow**: Simple Approve/Deny/Reply workflow for managing suggestions.

## Usage

```tsx
import ResumeAnalysisDashboard from '@/sd-components/00634e93-e7a0-4a1d-9c0a-49f1b3e93f4d';

function AnalysisPage() {
  return (
    <ResumeAnalysisDashboard 
      score={85}
      onAccept={(id) => console.log('Accepted', id)}
      onDeny={(id) => console.log('Denied', id)}
      onReply={(id, message) => console.log('Replied', id, message)}
    />
  );
}
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `score` | `number` | The optimization score (0-100) |
| `suggestions` | `Suggestion[]` | Array of suggestion objects to display |
| `onAccept` | `(id: string) => void` | Callback when user accepts a suggestion |
| `onDeny` | `(id: string) => void` | Callback when user denies a suggestion |
| `onReply` | `(id: string, message: string) => void` | Callback when user replies to a suggestion |
| `onScan` | `() => void` | Callback when user clicks "Rescan" |

## Dependencies

- `lucide-react`
- `framer-motion`
- `clsx`
- `tailwind-merge`
