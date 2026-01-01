import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  });
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;

  return formatDate(d);
}

export function formatBloodPressure(systolic: number, diastolic?: number): string {
  if (diastolic !== undefined) {
    return `${systolic}/${diastolic}`;
  }
  return `${systolic}`;
}

export function getBloodPressureStatus(systolic: number, diastolic?: number): {
  status: 'normal' | 'elevated' | 'high' | 'crisis';
  label: string;
  color: string;
} {
  if (systolic >= 180 || (diastolic && diastolic >= 120)) {
    return { status: 'crisis', label: 'Hypertensive Crisis', color: 'text-red-700' };
  }
  if (systolic >= 140 || (diastolic && diastolic >= 90)) {
    return { status: 'high', label: 'High', color: 'text-orange-600' };
  }
  if (systolic >= 120) {
    return { status: 'elevated', label: 'Elevated', color: 'text-yellow-600' };
  }
  return { status: 'normal', label: 'Normal', color: 'text-green-600' };
}

export function getGlucoseStatus(value: number): {
  status: 'low' | 'normal' | 'high' | 'very_high';
  label: string;
  color: string;
} {
  if (value < 70) {
    return { status: 'low', label: 'Low', color: 'text-yellow-600' };
  }
  if (value <= 100) {
    return { status: 'normal', label: 'Normal', color: 'text-green-600' };
  }
  if (value <= 180) {
    return { status: 'high', label: 'High', color: 'text-orange-600' };
  }
  return { status: 'very_high', label: 'Very High', color: 'text-red-700' };
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function formatMeasurementType(type: string): string {
  const types: Record<string, string> = {
    blood_pressure: 'Blood Pressure',
    glucose: 'Blood Glucose',
    weight: 'Weight',
    heart_rate: 'Heart Rate',
    temperature: 'Temperature',
    oxygen_saturation: 'Oxygen Saturation',
  };
  return types[type] || capitalizeFirst(type.replace(/_/g, ' '));
}

export function getMeasurementUnit(type: string): string {
  const units: Record<string, string> = {
    blood_pressure: 'mmHg',
    glucose: 'mmol/L',
    weight: 'kg',
    heart_rate: 'bpm',
    temperature: '°C',
    oxygen_saturation: '%',
  };
  return units[type] || '';
}
