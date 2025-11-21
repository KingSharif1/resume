'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered 
} from 'lucide-react';

interface BasicEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  rows?: number;
}

export function BasicEditor({ 
  content, 
  onChange, 
  placeholder = 'Start typing...',
  rows = 6
}: BasicEditorProps) {
  const [value, setValue] = useState(content || '');
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    onChange(e.target.value);
  };
  
  const insertFormatting = (tag: string) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    let newText = '';
    let cursorPosition = 0;
    
    switch(tag) {
      case 'bold':
        newText = value.substring(0, start) + `**${selectedText}**` + value.substring(end);
        cursorPosition = end + 4;
        break;
      case 'italic':
        newText = value.substring(0, start) + `*${selectedText}*` + value.substring(end);
        cursorPosition = end + 2;
        break;
      case 'underline':
        newText = value.substring(0, start) + `_${selectedText}_` + value.substring(end);
        cursorPosition = end + 2;
        break;
      case 'bulletList':
        // Add bullet to each line or start a new bullet list
        if (selectedText) {
          const lines = selectedText.split('\n');
          const bulletedLines = lines.map(line => `• ${line}`).join('\n');
          newText = value.substring(0, start) + bulletedLines + value.substring(end);
          cursorPosition = end + lines.length * 2;
        } else {
          newText = value.substring(0, start) + '• ' + value.substring(end);
          cursorPosition = start + 2;
        }
        break;
      case 'orderedList':
        // Add numbers to each line or start a new numbered list
        if (selectedText) {
          const lines = selectedText.split('\n');
          const numberedLines = lines.map((line, i) => `${i + 1}. ${line}`).join('\n');
          newText = value.substring(0, start) + numberedLines + value.substring(end);
          cursorPosition = end + lines.length * 3;
        } else {
          newText = value.substring(0, start) + '1. ' + value.substring(end);
          cursorPosition = start + 3;
        }
        break;
      default:
        return;
    }
    
    setValue(newText);
    onChange(newText);
    
    // Set cursor position after formatting
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPosition, cursorPosition);
    }, 0);
  };

  return (
    <div className="basic-editor border rounded-md">
      <div className="border-b p-2 flex gap-1 bg-slate-50">
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={() => insertFormatting('bold')}
          className="h-8 w-8 p-0"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={() => insertFormatting('italic')}
          className="h-8 w-8 p-0"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={() => insertFormatting('underline')}
          className="h-8 w-8 p-0"
        >
          <Underline className="h-4 w-4" />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={() => insertFormatting('bulletList')}
          className="h-8 w-8 p-0"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={() => insertFormatting('orderedList')}
          className="h-8 w-8 p-0"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>
      <Textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        className="resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
      />
    </div>
  );
}
