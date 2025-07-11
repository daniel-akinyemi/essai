import React from 'react';
import { CheckCircle, AlertCircle, Loader2, Clock } from 'lucide-react';

interface AutoSaveStatusProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
  frequency?: string;
  className?: string;
}

export function AutoSaveStatus({ status, frequency, className = '' }: AutoSaveStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'saving':
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          text: 'Auto-saving...',
          color: 'text-blue-600'
        };
      case 'saved':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          text: 'Auto-saved',
          color: 'text-green-600'
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          text: 'Auto-save failed',
          color: 'text-red-600'
        };
      default:
        return {
          icon: <Clock className="h-4 w-4" />,
          text: frequency ? `Auto-saves every ${frequency}s` : 'Auto-save enabled',
          color: 'text-gray-500'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`flex items-center gap-2 text-sm ${config.color} ${className}`}>
      {config.icon}
      <span>{config.text}</span>
    </div>
  );
} 