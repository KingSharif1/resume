/**
 * Text diff utilities for highlighting changes between original and suggested text
 */

export interface DiffSegment {
  text: string;
  type: 'unchanged' | 'removed' | 'added';
}

/**
 * Simple word-level diff algorithm
 * Highlights words that were added, removed, or changed
 */
export function getWordDiff(original: string, suggested: string): {
  originalSegments: DiffSegment[];
  suggestedSegments: DiffSegment[];
} {
  // Split into words while preserving punctuation
  const originalWords = original.match(/\S+|\s+/g) || [];
  const suggestedWords = suggested.match(/\S+|\s+/g) || [];

  // Simple LCS-based diff
  const originalSegments: DiffSegment[] = [];
  const suggestedSegments: DiffSegment[] = [];

  let i = 0;
  let j = 0;

  while (i < originalWords.length || j < suggestedWords.length) {
    // If words match, mark as unchanged
    if (i < originalWords.length && j < suggestedWords.length && originalWords[i] === suggestedWords[j]) {
      originalSegments.push({ text: originalWords[i], type: 'unchanged' });
      suggestedSegments.push({ text: suggestedWords[j], type: 'unchanged' });
      i++;
      j++;
    }
    // If original has more words, mark as removed
    else if (i < originalWords.length && (j >= suggestedWords.length || originalWords[i] !== suggestedWords[j])) {
      // Look ahead to see if this word appears later in suggested
      const foundLater = suggestedWords.slice(j).indexOf(originalWords[i]);
      if (foundLater !== -1 && foundLater < 5) {
        // Word appears later, mark intermediate words as added
        for (let k = 0; k < foundLater; k++) {
          suggestedSegments.push({ text: suggestedWords[j + k], type: 'added' });
        }
        j += foundLater;
      } else {
        originalSegments.push({ text: originalWords[i], type: 'removed' });
        i++;
      }
    }
    // If suggested has more words, mark as added
    else if (j < suggestedWords.length) {
      suggestedSegments.push({ text: suggestedWords[j], type: 'added' });
      j++;
    }
  }

  return { originalSegments, suggestedSegments };
}

/**
 * Merge consecutive segments of the same type
 */
export function mergeSegments(segments: DiffSegment[]): DiffSegment[] {
  if (segments.length === 0) return [];

  const merged: DiffSegment[] = [];
  let current = segments[0];

  for (let i = 1; i < segments.length; i++) {
    if (segments[i].type === current.type) {
      current.text += segments[i].text;
    } else {
      merged.push(current);
      current = segments[i];
    }
  }
  merged.push(current);

  return merged;
}
