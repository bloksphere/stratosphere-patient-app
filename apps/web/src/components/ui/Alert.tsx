'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export function Alert({ variant = 'info', title, children, onClose, className }: AlertProps) {
  const variants = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: Info,
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: CheckCircle,
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: AlertCircle,
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: XCircle,
    },
  };

  const { bg, border, text, icon: Icon } = variants[variant];

  return (
    <div className={cn('rounded-lg border p-4', bg, border, className)}>
      <div className="flex">
        <Icon className={cn('h-5 w-5 flex-shrink-0', text)} />
        <div className="ml-3 flex-1">
          {title && <h3 className={cn('text-sm font-medium', text)}>{title}</h3>}
          <div className={cn('text-sm', text, title && 'mt-1')}>{children}</div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className={cn('ml-3 inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2', text)}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
