import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const loadDataFromStorage = <T,>(localStorageKey: string): T[] => {
  try {
    const storedData = localStorage.getItem(localStorageKey);
    return storedData ? JSON.parse(storedData) : [];
  } catch (error) {
    console.error(`Error loading data ${localStorageKey} from localStorage:`, error);
    return [];
  }
};

export const saveDataToStorage = <T,>(data: T[], localStorageKey: string) => {
  try {
    localStorage.setItem(localStorageKey, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving data ${localStorageKey} to localStorage:`, error);
  }
};