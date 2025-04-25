import { clsx, type ClassValue } from "clsx"
import { nanoid } from "nanoid";
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

export const extractVariablesObj = (
    str: string,
    idPrefix: string
): Record<string, { id: string; name: string; text: string }> => {
    const matches = str.match(/\{\{\s*[^}]+\s*}}/g) || [];
    const result: Record<string, { id: string; name: string; text: string }> = {};

    matches.forEach((variable) => {
        const varId = `${idPrefix}${nanoid(6)}`;
        result[varId] = {
            id: varId,
            name: variable.trim(),
            text: "Lorem ipsum dolor sit"
        };
    });

    return result;
};