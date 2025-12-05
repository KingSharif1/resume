/**
 * Scroll utilities for suggestion highlighting
 * 
 * Handles smooth scrolling to bring suggestions and highlights into view
 */

/**
 * Scroll element into view with smooth animation
 */
export function scrollToElement(
  element: HTMLElement | null,
  options?: {
    block?: ScrollLogicalPosition;
    behavior?: ScrollBehavior;
    offset?: number;
  }
) {
  if (!element) return;

  const {
    block = 'center',
    behavior = 'smooth',
    offset = 0
  } = options || {};

  // Get element position
  const elementRect = element.getBoundingClientRect();
  const absoluteElementTop = elementRect.top + window.pageYOffset;
  const middle = absoluteElementTop - (window.innerHeight / 2) + (elementRect.height / 2) + offset;

  window.scrollTo({
    top: middle,
    behavior
  });
}

/**
 * Scroll to suggestion highlight in preview
 */
export function scrollToSuggestionHighlight(suggestionId: string) {
  const highlight = document.querySelector(`[data-suggestion-id="${suggestionId}"]`);
  if (highlight instanceof HTMLElement) {
    scrollToElement(highlight, { block: 'center' });
  }
}

/**
 * Scroll to suggestion card in panel
 */
export function scrollToSuggestionCard(suggestionId: string) {
  const card = document.querySelector(`[data-suggestion-card="${suggestionId}"]`);
  if (card instanceof HTMLElement) {
    scrollToElement(card, { block: 'nearest' });
  }
}

/**
 * Check if element is in viewport
 */
export function isElementInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}
