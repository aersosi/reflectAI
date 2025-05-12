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

/**
 * Replaces all occurrences of specified substrings in a string based on a mapping object.
 *
 * @param {string} str - The input string in which replacements should be made.
 * @param {Record<string, string>} mapObj - An object where each key is a substring to search for,
 * and its value is the replacement string.
 *
 * @returns {string} The resulting string after all replacements have been made.
 *
 * @example
 * replaceAll("The cat chased the dog", { cat: "dog", dog: "goat" });
 * // => "The dog chased the goat"
 **/
export const replaceAll = (str: string, mapObj: Record<string, string>): string => {
    const re = new RegExp(Object.keys(mapObj).join("|"), "g");
    return str.replace(re, matched => mapObj[matched]);
}