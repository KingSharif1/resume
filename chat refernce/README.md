# MylesChatInterface

A modern, high-fidelity AI chat interface component designed for the Myles AI Resume project.

## Features

- **Modern Aesthetic**: Clean, professional design with refined typography and whitespace.
- **Interactive Sidebar**: Collapsible history sidebar with "New Chat" functionality.
- **Animations**: Smooth message entry and interaction states using `framer-motion`.
- **Responsive**: Fully responsive layout that works on mobile and desktop.
- **Typing Indicators**: Visual feedback when the AI is processing.

## Usage

```tsx
import { MylesChatInterface } from '@/sd-components/e559ffae-b10d-4901-b258-7efe4fc2c88e';

function MyPage() {
  return (
    <div style={{ height: '600px' }}>
      <MylesChatInterface 
        userName="Interviewer"
        aiName="Myles"
        onSendMessage={async (msg) => {
          console.log("User sent:", msg);
          // Handle API call here
        }}
      />
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialMessages` | `Message[]` | `[]` | Initial chat history to display |
| `onSendMessage` | `(msg: string) => Promise<void>` | `undefined` | Callback when user sends a message. If not provided, simulates a response. |
| `userName` | `string` | `"Visitor"` | Name of the current user |
| `aiName` | `string` | `"Myles"` | Name of the AI assistant |
| `className` | `string` | `undefined` | Additional CSS classes for the container |

## Dependencies

- `framer-motion`
- `lucide-react`
- `dayjs`
- `clsx`
- `tailwind-merge`
