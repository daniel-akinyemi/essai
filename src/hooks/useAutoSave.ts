import { useState, useEffect, useRef } from 'react';

interface UseAutoSaveOptions {
  content: string;
  autoSaveFrequency: string;
  onSave: (content: string) => Promise<void>;
  enabled?: boolean;
}

export function useAutoSave({ content, autoSaveFrequency, onSave, enabled = true }: UseAutoSaveOptions) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastContentRef = useRef<string>('');

  // Convert frequency string to milliseconds
  const getFrequencyMs = (frequency: string): number => {
    const freq = parseInt(frequency);
    if (frequency.includes('minute')) return freq * 60 * 1000;
    return freq * 1000; // seconds
  };

  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Don't auto-save if disabled or content hasn't changed
    if (!enabled || content === lastSaved || content === lastContentRef.current) {
      return;
    }

    // Update last content reference
    lastContentRef.current = content;

    // Set new timeout
    const frequencyMs = getFrequencyMs(autoSaveFrequency);
    timeoutRef.current = setTimeout(async () => {
      if (content.trim() && content !== lastSaved) {
        setIsSaving(true);
        setSaveStatus('saving');
        
        try {
          await onSave(content);
          setLastSaved(content);
          setSaveStatus('saved');
          
          // Clear saved status after 3 seconds
          setTimeout(() => {
            setSaveStatus('idle');
          }, 3000);
        } catch (error) {
          console.error('Auto-save failed:', error);
          setSaveStatus('error');
          
          // Clear error status after 5 seconds
          setTimeout(() => {
            setSaveStatus('idle');
          }, 5000);
        } finally {
          setIsSaving(false);
        }
      }
    }, frequencyMs);

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, autoSaveFrequency, enabled, lastSaved, onSave]);

  // Manual save function
  const saveNow = async () => {
    if (content.trim() && content !== lastSaved) {
      setIsSaving(true);
      setSaveStatus('saving');
      
      try {
        await onSave(content);
        setLastSaved(content);
        setSaveStatus('saved');
        
        setTimeout(() => {
          setSaveStatus('idle');
        }, 3000);
      } catch (error) {
        console.error('Manual save failed:', error);
        setSaveStatus('error');
        
        setTimeout(() => {
          setSaveStatus('idle');
        }, 5000);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return {
    isSaving,
    saveStatus,
    saveNow,
    lastSaved
  };
} 