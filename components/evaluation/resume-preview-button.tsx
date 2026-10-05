'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';

interface ResumePreviewButtonProps {
  resumeKey: string;
  className?: string;
}

/**
 * Opens the stored résumé in a new tab via a short-lived signed URL.
 *
 * The tab is opened synchronously on click and pointed at the URL once it
 * arrives, so popup blockers treat it as user-initiated.
 */
export function ResumePreviewButton({ resumeKey, className }: ResumePreviewButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    const tab = window.open('', '_blank');
    setLoading(true);
    try {
      const response = await fetch(`/api/resume/${encodeURIComponent(resumeKey)}`);
      const result = await response.json();
      if (!response.ok || !result.data?.url) throw new Error(result.error?.message);
      if (tab) tab.location.href = result.data.url;
      else window.location.href = result.data.url;
    } catch (error) {
      console.error('Failed to open résumé:', error);
      tab?.close();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="secondary" onClick={handleClick} isLoading={loading} className={className}>
      Preview
    </Button>
  );
}
