import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateApiKey(): string {
  const array = new Uint8Array(32);
  if (typeof window !== 'undefined') {
    window.crypto.getRandomValues(array);
  } else {
    // Fallback for server-side
    require('crypto').randomFillSync(array);
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}
