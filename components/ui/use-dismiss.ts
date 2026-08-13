'use client';

import { useEffect, type RefObject } from 'react';

/**
 * Close a popover on outside click or Escape.
 *
 * Shared by the header's user menu and the evaluation page's overflow menu so
 * the two can't drift apart. The click listener runs in the capture phase so a
 * trigger inside the container can still toggle normally.
 */
export function useDismiss(
  ref: RefObject<HTMLElement | null>,
  open: boolean,
  onDismiss: () => void
) {
  useEffect(() => {
    if (!open) return;

    const handleClick = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) {
        onDismiss();
      }
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onDismiss();
    };

    document.addEventListener('click', handleClick, true);
    document.addEventListener('keydown', handleKey);

    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('keydown', handleKey);
    };
  }, [ref, open, onDismiss]);
}
