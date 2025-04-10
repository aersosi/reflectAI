import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const loadSessionsFromStorage = <T,>(localStorageKey: string): T[] => {
  try {
    const storedSessions = localStorage.getItem(localStorageKey);
    return storedSessions ? JSON.parse(storedSessions) : [];
  } catch (error) {
    console.error("Error loading sessions from localStorage:", error);
    return [];
  }
};

export const saveSessionsToStorage = <T,>(sessions: T[], localStorageKey: string) => {
  try {
    localStorage.setItem(localStorageKey, JSON.stringify(sessions));
  } catch (error) {
    console.error("Error saving sessions to localStorage:", error);
  }
};